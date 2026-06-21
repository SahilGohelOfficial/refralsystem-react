import React, { useState } from 'react';
import { Search, Upload, Filter, Grid, List, MoreVertical, Image as ImageIcon, Video, File, Eye } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const mockMedia = [
  { id: 1, name: 'hero-banner.jpg', type: 'image', size: '2.4 MB', date: '2 days ago', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
  { id: 2, name: 'product-showcase.mp4', type: 'video', size: '45.1 MB', date: '3 days ago', url: '' },
  { id: 3, name: 'abstract-bg.png', type: 'image', size: '1.2 MB', date: '1 week ago', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop' },
  { id: 4, name: 'logo-dark.svg', type: 'image', size: '45 KB', date: '2 weeks ago', url: 'https://images.unsplash.com/photo-1626908013943-df94de54984c?q=80&w=2673&auto=format&fit=crop' },
  { id: 5, name: 'brand-assets.zip', type: 'document', size: '124 MB', date: '1 month ago', url: '' },
  { id: 6, name: 'social-post.jpg', type: 'image', size: '840 KB', date: '1 month ago', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop' },
];

const MediaGallery = () => {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Media Gallery</h1>
          <p className="text-sm text-text-secondary mt-1">Manage all your uploaded files and assets.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Upload size={16} />
          Upload Files
        </Button>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/50">
        <div className="w-full sm:w-96">
          <Input icon={Search} placeholder="Search files..." />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="gap-2 shrink-0">
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          <div className="flex items-center bg-surface border border-border rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text'}`}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </Card>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {mockMedia.map((file) => (
            <Card key={file.id} className="p-3 group hover:border-primary/50 cursor-pointer flex flex-col h-full">
              <div className="aspect-square rounded-xl bg-surface mb-3 flex items-center justify-center overflow-hidden relative border border-border">
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : file.type === 'video' ? (
                  <Video size={32} className="text-text-secondary" />
                ) : (
                  <File size={32} className="text-text-secondary" />
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-surface text-text rounded-lg hover:bg-primary hover:text-background transition-colors shadow-lg">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-start justify-between gap-2 mt-auto">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{file.size}</p>
                </div>
                <button className="text-text-secondary hover:text-text p-1 shrink-0">
                  <MoreVertical size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-text-secondary">
          List view is not implemented in this demo. Please use the grid view.
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
