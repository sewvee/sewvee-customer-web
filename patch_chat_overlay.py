import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

bad = """        {showAttachMenu && (
          <div className="absolute bottom-16 left-3 bg-white border border-gray-100 shadow-lg rounded-2xl p-2 flex flex-col gap-1 z-50 min-w-[160px]">"""

good = """        {showAttachMenu && (
          <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)}></div>
          <div className="absolute bottom-16 left-3 bg-white border border-gray-100 shadow-lg rounded-2xl p-2 flex flex-col gap-1 z-50 min-w-[160px]">"""

content = content.replace(bad, good)

# also need to close the Fragment
bad_end = """              Collage Maker
            </button>
          </div>
        )}"""

good_end = """              Collage Maker
            </button>
          </div>
          </>
        )}"""

content = content.replace(bad_end, good_end)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)

