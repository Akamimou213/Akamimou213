import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "lib"))
import web  # noqa: E402

handler = web.make(web.price_batch, 3)
