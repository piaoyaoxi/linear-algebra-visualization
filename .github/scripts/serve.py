"""Static file server for local checks and CI.

`python3 -m http.server` keeps a listen backlog of 5. learn.html requests ~250
files at once; on macOS the extra connections are reset, a script silently
fails to load and its chapter breaks, which made the browser checks flaky.
"""
import functools
import http.server
import sys


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    directory = sys.argv[2] if len(sys.argv) > 2 else "current"
    handler = functools.partial(QuietHandler, directory=directory)
    with Server(("", port), handler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    main()
