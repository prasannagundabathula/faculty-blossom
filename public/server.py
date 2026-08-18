"""
BVCITS College ERP & Student Portal Local Development Server
Serves static files, clean URLs, and CORS headers.
"""

import http.server
import socketserver
import os
import sys
import mimetypes

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Ensure proper mimetypes
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('image/jpeg', '.jpg')
mimetypes.add_type('image/jpeg', '.jpeg')
mimetypes.add_type('image/png', '.png')
mimetypes.add_type('image/svg+xml', '.svg')

class BVCITSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def translate_path(self, path):
        # Clean URL rewrite support (e.g., /about -> /about.html, /student-dashboard -> /student-dashboard.html)
        clean_path = path.split('?', 1)[0].split('#', 1)[0]
        full_path = super().translate_path(path)

        if not os.path.exists(full_path):
            if os.path.exists(full_path + '.html'):
                return full_path + '.html'
            # Check if directory index
            html_index = os.path.join(full_path, 'index.html')
            if os.path.exists(html_index):
                return html_index

        return full_path

def run_server():
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    
    # Try port 3000, fallback to 8080 or 5000 if in use
    for test_port in [3000, 8080, 5000, 8000]:
        try:
            with socketserver.TCPServer(("", test_port), BVCITSRequestHandler) as httpd:
                print(f"============================================================")
                print(f"  BVCITS College ERP & CodeQuest Portal Server is LIVE!")
                print(f"  URL: http://localhost:{test_port}/")
                print(f"  URL: http://127.0.0.1:{test_port}/")
                print(f"============================================================")
                sys.stdout.flush()
                httpd.serve_forever()
                break
        except OSError as e:
            if "Address already in use" in str(e) or "10048" in str(e):
                print(f"Port {test_port} busy, trying next port...")
                continue
            else:
                raise e

if __name__ == '__main__':
    run_server()
