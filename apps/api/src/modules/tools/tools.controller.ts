import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TOOL_CATALOG, getToolBySlug, getToolsByCategory } from '@formatflow/shared';

@ApiTags('Tools & Formats')
@Controller('api/v1')
export class ToolsController {
  @Get('tools')
  @ApiOperation({ summary: 'List all available conversion tools' })
  getAllTools() {
    return {
      total: TOOL_CATALOG.length,
      tools: TOOL_CATALOG,
      categories: [
        { key: 'image', label: 'Image Tools', count: getToolsByCategory('image').length },
        { key: 'pdf', label: 'PDF Tools', count: getToolsByCategory('pdf').length },
        { key: 'document', label: 'Document Tools', count: getToolsByCategory('document').length },
      ],
    };
  }

  @Get('tools/:slug')
  @ApiOperation({ summary: 'Get details and instructions for a specific conversion tool' })
  getTool(@Param('slug') slug: string) {
    const tool = getToolBySlug(slug);
    if (!tool) {
      throw new NotFoundException(`Tool "${slug}" not found.`);
    }
    return tool;
  }

  @Get('formats')
  @ApiOperation({ summary: 'Get matrix of supported formats and conversions' })
  getSupportedFormats() {
    return {
      images: ['JPG', 'JPEG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'BMP', 'GIF', 'SVG'],
      pdf: ['PDF', 'Images to PDF', 'Merge', 'Split', 'Rotate', 'Reorder', 'Compress'],
      documents: ['CSV', 'XLSX', 'TXT', 'HTML', 'DOCX'],
      maxFileSizeMb: 50,
      retentionPolicyMinutes: 60,
    };
  }
}
