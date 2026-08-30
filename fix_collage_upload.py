import re

with open('src/app/(app)/orders/[id]/page.tsx', 'r') as f:
    content = f.read()

old_block = """          setPendingPhotos(prev => {
            const nextState = {
              ...prev,
              [outfitId]: [...(prev[outfitId] || []), fileUrl]
            };
            console.log('[DEBUG] pendingPhotos updating from', prev, 'to', nextState);
            return nextState;
          });

          setCollageOpen(false);
          setActiveOutfitForCollage(null);
        } catch (e) {"""

new_block = """          // Auto submit to backend
          await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${order.id.toString()}/outfits/${outfitId}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: formattedToken },
            body: JSON.stringify({ attachment_url: fileUrl, message: 'Uploaded reference photo via Customer Web', phone: user?.mobile ?? '' })
          });
          
          if (user?.mobile) {
            fetchOrders(user.mobile);
          }

          setCollageOpen(false);
          setActiveOutfitForCollage(null);
        } catch (e) {"""

content = content.replace(old_block, new_block)

with open('src/app/(app)/orders/[id]/page.tsx', 'w') as f:
    f.write(content)
