import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "_lib"))
import web  # noqa: E402

class handler(web.make(web.history, 30)):
    pass
