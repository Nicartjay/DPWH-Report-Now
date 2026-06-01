// Next.js index page - redirects to static index.html
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirect to static index.html
    window.location.href = '/index.html';
  }, []);

  return null;
}

// Made with Bob
