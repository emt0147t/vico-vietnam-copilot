#!/usr/bin/env python3
"""
Local Vietnamese Embedding Service
Runs HTTP server with dangvantuan/vietnamese-embedding model
Models embeddings locally (no API calls needed!)
"""

import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from sentence_transformers import SentenceTransformer
from pyvi.ViTokenizer import tokenize

# Load model once at startup
print("📥 Loading vietnamese-embedding model...")
model = SentenceTransformer('dangvantuan/vietnamese-embedding')
print("✅ Model loaded successfully!")
print("   - Dimension: 768")
print("   - Accuracy: 88.33%")
print("   - Speed: 50+ texts/second on CPU")


class EmbeddingHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ready'}).encode())
        
        elif parsed_path.path == '/embed':
            # Single embedding from query param
            query_params = parse_qs(parsed_path.query)
            
            if 'text' not in query_params:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Missing text parameter'}).encode())
                return
            
            text = query_params['text'][0]
            
            try:
                tokenized = tokenize(text)
                embedding = model.encode([tokenized])[0]
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {
                    'text': text,
                    'embedding': embedding.tolist(),
                    'dimension': len(embedding)
                }
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def do_POST(self):
        """Handle POST requests for batch embeddings"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/embed':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                data = json.loads(body.decode())
                
                texts = data.get('texts', [])
                if not texts:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Missing texts array'}).encode())
                    return
                
                # Tokenize all texts
                tokenized_texts = [tokenize(text) for text in texts]
                
                # Get embeddings
                embeddings = model.encode(tokenized_texts)
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {
                    'texts': texts,
                    'embeddings': [emb.tolist() for emb in embeddings],
                    'count': len(embeddings)
                }
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass


def run_server(port=5000):
    """Start the embedding server"""
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, EmbeddingHandler)
    print(f'\n🚀 Vietnamese Embedding Server listening on port {port}')
    print(f'   Endpoints:')
    print(f'   - GET  /health → Health check')
    print(f'   - GET  /embed?text=... → Single embedding')
    print(f'   - POST /embed → Batch embeddings (send JSON with "texts" array)')
    print(f'\n⚡ Ready for 50+ embeddings per second!\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n✅ Server stopped')
        httpd.shutdown()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    run_server(port)
