import re

path = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/customer-portal/customer-portal.controller.ts'
with open(path, 'r') as f:
    content = f.read()

# Replace constructor to inject services
new_imports = "import { Controller, Get, Post, Put, Patch, Delete, Param, Req, UseGuards, Body, Query, HttpCode, HttpStatus, BadRequestException, Res, ParseIntPipe, NotFoundException } from '@nestjs/common';\nimport { Response } from 'express';\nimport { DataSource } from 'typeorm';\nimport { OrderInvoiceService } from '../order/services/order-invoice.service';\n"
content = re.sub(r'import \{ Controller.*?;', new_imports.strip(), content, count=1)

old_constructor = "constructor(private readonly service: CustomerPortalService) {}"
new_constructor = """constructor(
    private readonly service: CustomerPortalService,
    private readonly dataSource: DataSource,
    private readonly orderInvoiceService: OrderInvoiceService
  ) {}"""
content = content.replace(old_constructor, new_constructor)

# Add the new endpoint
new_endpoint = """
  @Get('orders/:id/invoice')
  @ApiOperation({ summary: 'Stream customer copy invoice as PDF for a specific order (public)' })
  async downloadInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    // 1. Get the latest successful payment
    const paymentResult = await this.dataSource.query(
      `SELECT id FROM order_payments WHERE order_id = $1 AND payment_status = 'SUCCESS' ORDER BY created_at DESC LIMIT 1`,
      [id]
    );
    const paymentId = paymentResult.length ? paymentResult[0].id : 0;

    // 2. Generate PDF buffer
    const result = await this.orderInvoiceService.generatePdfBuffer(id, paymentId);
    if (!result) {
      res.status(404).json({ success: false, message: 'Failed to generate invoice' });
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `cus-${result.customerId}-order${id}-cuscopy-${dateStr}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Transfer-Encoding': 'binary',
      'Content-Length': String(result.buffer.length),
      'Cache-Control': 'no-store',
    });
    res.end(result.buffer);
  }
"""

# Insert before the last closing brace
last_brace_idx = content.rfind('}')
if last_brace_idx != -1:
    content = content[:last_brace_idx] + new_endpoint + content[last_brace_idx:]

with open(path, 'w') as f:
    f.write(content)
