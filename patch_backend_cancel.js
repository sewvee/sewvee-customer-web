const fs = require('fs');

const controllerFile = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/customer-portal/customer-portal.controller.ts';
let ctrlContent = fs.readFileSync(controllerFile, 'utf8');

const newRoute = `
  @Patch('orders/:id/status')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status from customer portal' })
  async updateOrderStatus(
    @Req() req,
    @Param('id') orderId: string,
    @Body() body: { status_id: number }
  ) {
    if (!body.status_id) throw new BadRequestException('status_id is required');
    return this.service.updateOrderStatus(parseInt(orderId, 10), body.status_id, req.user.phone);
  }
}
`;

ctrlContent = ctrlContent.replace(/\n\}\s*$/, newRoute);
fs.writeFileSync(controllerFile, ctrlContent);

const serviceFile = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/customer-portal/customer-portal.service.ts';
let srvContent = fs.readFileSync(serviceFile, 'utf8');

const newMethod = `
  async updateOrderStatus(orderId: number, statusId: number, phone: string) {
    try {
      // First verify the order belongs to this customer
      const order = await this.dataSource.query(
        \`SELECT id FROM orders WHERE id = $1 AND customer_mobile = $2\`,
        [orderId, phone]
      );
      if (!order.length) {
        throw new Error('Order not found or unauthorized');
      }

      await this.dataSource.query(
        \`UPDATE orders SET status_id = $1, updated_at = NOW() WHERE id = $2\`,
        [statusId, orderId]
      );
      
      return { success: true, message: 'Order status updated successfully' };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}
`;

srvContent = srvContent.replace(/\n\}\s*$/, newMethod);
fs.writeFileSync(serviceFile, srvContent);
console.log('Backend patched');
