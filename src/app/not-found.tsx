
export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>404 - Page Not Found</h2>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>The page you are looking for does not exist.</p>
          </div>
        </div>
      </body>
    </html>
  )
}
