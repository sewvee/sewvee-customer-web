const fs = require('fs');
const controllerFile = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/order/order.controller.ts';
const serviceFile = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/order/order.service.ts';

let cContent = fs.readFileSync(controllerFile, 'utf8');
const cRoute = `
  @Delete(':id/photos/:photoId')
  @ApiOperation({ summary: 'Delete a photo from an order' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiParam({ name: 'photoId', type: 'number' })
  async deleteOrderPhoto(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    try {
      const result = await this.orderService.deleteOrderPhoto(id, photoId, (req.user?.companyId || req.user?.company_id) ?? req.headers["company-id"]);
      return ApiResponseDto.success(result, 'Photo deleted successfully');
    } catch (error) {
      const msg = error.message || 'Unknown error occurred in deleteOrderPhoto';
      return ApiResponseDto.error(msg, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id/outfits/:outfitId/services/:serviceId')`;
cContent = cContent.replace("  @Delete(':id/outfits/:outfitId/services/:serviceId')", cRoute);
fs.writeFileSync(controllerFile, cContent);

let sContent = fs.readFileSync(serviceFile, 'utf8');
const sMethod = `
  async deleteOrderPhoto(orderId: number, photoId: number, companyId: number): Promise<any> {
    const order = await this.orderRepo.findOne({ where: { id: orderId, company_id: companyId } });
    if (!order) throw new NotFoundException(\`Order \${orderId} not found\`);

    const photo = await this.photoRepo.findOne({ where: { id: photoId, order_id: orderId } });
    if (!photo) throw new NotFoundException(\`Photo \${photoId} not found\`);

    await this.photoRepo.remove(photo);
    return { success: true };
  }

  async deleteOutfitService`;
sContent = sContent.replace("  async deleteOutfitService", sMethod);
fs.writeFileSync(serviceFile, sContent);
console.log('Backend patched');
