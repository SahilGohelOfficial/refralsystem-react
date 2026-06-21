import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  HardDrive, 
  Upload,
  MoreVertical,
  Download,
  Trash2,
  FolderOpen,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';

const StatCard = ({ title, value, icon: Icon, trend, isLoading }: { title: string, value: string | number, icon: any, trend: number, isLoading: boolean }) => (
  <Card className="relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={64} className="text-primary transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
    </div>
    <CardHeader className="pb-2">
      <CardTitle className="text-text-secondary text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-24 mb-2" />
      ) : (
        <div className="text-3xl font-bold text-text mb-2">{value}</div>
      )}
      {isLoading ? (
        <Skeleton className="h-4 w-32" />
      ) : (
        <p className="text-xs text-text-secondary">
          <span className={trend > 0 ? 'text-success' : 'text-error'}>
            {trend > 0 ? '+' : ''}{trend}%
          </span> from last month
        </p>
      )}
    </CardContent>
  </Card>
);

const recentUploads = [
  { id: 1, name: 'hero-banner-v2.jpg', type: 'Image', size: '2.4 MB', date: '2 mins ago', status: 'Completed' },
  { id: 2, name: 'product-demo-vid.mp4', type: 'Video', size: '45.1 MB', date: '1 hour ago', status: 'Completed' },
  { id: 3, name: 'brand-guidelines.pdf', type: 'Document', size: '5.2 MB', date: '3 hours ago', status: 'Completed' },
  { id: 4, name: 'background-pattern.png', type: 'Image', size: '1.1 MB', date: '5 hours ago', status: 'Completed' },
  { id: 5, name: 'promo-animation.gif', type: 'Image', size: '8.4 MB', date: '1 day ago', status: 'Completed' },
];

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard Overview</h1>
          <p className="text-sm text-text-secondary mt-1">Here's what's happening in your media gallery today.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Upload size={16} />
          Upload New Media
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Media" value="2,451" icon={FolderOpen} trend={12} isLoading={isLoading} />
        <StatCard title="Images" value="1,832" icon={ImageIcon} trend={8} isLoading={isLoading} />
        <StatCard title="Videos" value="415" icon={Video} trend={-2} isLoading={isLoading} />
        <StatCard title="Storage Used" value="48.5 GB" icon={HardDrive} trend={15} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {recentUploads.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-surface border border-border ${file.type === 'Video' ? 'text-primary' : 'text-text-secondary'}`}>
                            {file.type === 'Image' ? <ImageIcon size={16} /> : <Video size={16} />}
                          </div>
                          {file.name}
                        </div>
                      </TableCell>
                      <TableCell>{file.type}</TableCell>
                      <TableCell>{file.size}</TableCell>
                      <TableCell>{file.date}</TableCell>
                      <TableCell>
                        <Badge variant="success">{file.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Dropdown trigger={
                          <button className="p-1 text-text-secondary hover:text-text hover:bg-surface rounded-md transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        }>
                          <DropdownItem><Download size={14} /> Download</DropdownItem>
                          <DropdownItem danger><Trash2 size={14} /> Delete</DropdownItem>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="secondary" fullWidth className="justify-start gap-3 h-12 border-border/50">
                <Upload size={18} className="text-primary" />
                Bulk Upload
              </Button>
              <Button variant="secondary" fullWidth className="justify-start gap-3 h-12 border-border/50">
                <FolderOpen size={18} className="text-primary" />
                Create Folder
              </Button>
              <Button variant="secondary" fullWidth className="justify-start gap-3 h-12 border-border/50">
                <Settings size={18} className="text-primary" />
                Gallery Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Storage Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-secondary">Images</span>
                      <span className="font-medium text-text">24.2 GB</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full shadow-[0_0_10px_rgba(212,160,23,0.5)]" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-secondary">Videos</span>
                      <span className="font-medium text-text">18.5 GB</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div className="bg-success h-2 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-secondary">Documents</span>
                      <span className="font-medium text-text">5.8 GB</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Total Used (100GB limit)</span>
                    <span className="font-bold text-text">48.5%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
