const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../lib/supabase');
const auth = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/upload/:caseId — upload file attachment
router.post('/:caseId', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const { caseId } = req.params;
  const { label = '' } = req.body;
  const ext = req.file.originalname.split('.').pop();
  const path = `${caseId}/${req.user.id}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('case-attachments')
    .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

  if (uploadError) return res.status(400).json({ error: uploadError.message });

  const { data: attachment, error: dbError } = await supabase
    .from('attachments')
    .insert({
      case_id: caseId,
      uploader_id: req.user.id,
      label,
      storage_path: path,
      mime_type: req.file.mimetype,
    })
    .select()
    .single();

  if (dbError) return res.status(400).json({ error: dbError.message });

  // Create a signed URL (1 hour)
  const { data: urlData } = await supabase.storage
    .from('case-attachments')
    .createSignedUrl(path, 3600);

  res.status(201).json({ ...attachment, url: urlData?.signedUrl });
});

// GET /api/upload/:caseId — list attachments
router.get('/:caseId', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('case_id', req.params.caseId)
    .order('created_at');
  if (error) return res.status(400).json({ error: error.message });

  const withUrls = await Promise.all(data.map(async a => {
    const { data: urlData } = await supabase.storage
      .from('case-attachments')
      .createSignedUrl(a.storage_path, 3600);
    return { ...a, url: urlData?.signedUrl };
  }));

  res.json(withUrls);
});

module.exports = router;
