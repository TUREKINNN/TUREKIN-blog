import app from './app';

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  console.log(`[OK] Server running on http://localhost:${PORT}`);
  console.log(`[OK] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[OK] Upload dir: ${process.env.UPLOAD_DIR || './uploads'}`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[FAIL] Port ${PORT} is already in use.`);
    console.error('[FAIL] Stop the other process or change PORT in .env');
  } else {
    console.error('[FAIL] Failed to start server:', err.message);
  }
  process.exit(1);
});
