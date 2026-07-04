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
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import IconButton from '../../components/ui/IconButton';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: number;
  isLoading: boolean;
}) => (
  <Card variant="interactive" padding="md">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        {isLoading ? (
          <Skeleton className="h-8 w-24 mt-2" />
        ) : (
          <p className="stat-value mt-1">{value}</p>
        )}
        {isLoading ? (
          <Skeleton className="h-3.5 w-28 mt-2" />
        ) : (
          <p className="text-xs text-text-muted mt-2">
            <span className={trend > 0 ? 'text-success' : 'text-error'}>
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>{' '}
            from last month
          </p>
        )}
      </div>
      <div className="w-10 h-10 rounded-lg bg-primary-muted border border-primary/20 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-primary" strokeWidth={1.75} />
      </div>
    </div>
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
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page-shell">
      <PageHeader
        title="Dashboard Overview"
        description="Here's what's happening in your media gallery today."
        actions={
          <Button>
            <Upload size={16} />
            Upload New Media
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        <StatCard title="Total Media" value="2,451" icon={FolderOpen} trend={12} isLoading={isLoading} />
        <StatCard title="Images" value="1,832" icon={ImageIcon} trend={8} isLoading={isLoading} />
        <StatCard title="Videos" value="415" icon={Video} trend={-2} isLoading={isLoading} />
        <StatCard title="Storage Used" value="48.5 GB" icon={HardDrive} trend={15} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        <Card padding="none" className="lg:col-span-2 data-card">
          <div className="px-5 py-4 border-b border-border">
            <CardTitle>Recent Uploads</CardTitle>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-5 space-y-3">
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
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <tbody>
                  {recentUploads.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-text-muted">
                            {file.type === 'Image' ? (
                              <ImageIcon size={15} />
                            ) : (
                              <Video size={15} />
                            )}
                          </div>
                          <span className="truncate max-w-[180px]">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-text-secondary">{file.type}</TableCell>
                      <TableCell className="text-text-secondary tabular-nums">{file.size}</TableCell>
                      <TableCell className="text-text-secondary">{file.date}</TableCell>
                      <TableCell>
                        <Badge variant="success" dot>
                          {file.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dropdown
                          trigger={
                            <IconButton size="sm" aria-label="File actions">
                              <MoreVertical size={16} />
                            </IconButton>
                          }
                        >
                          <DropdownItem>
                            <Download size={14} /> Download
                          </DropdownItem>
                          <DropdownItem danger>
                            <Trash2 size={14} /> Delete
                          </DropdownItem>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:space-y-5">
          <Card padding="md">
            <CardHeader className="mb-4">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" fullWidth className="justify-start h-11">
                <Upload size={16} className="text-primary" />
                Bulk Upload
              </Button>
              <Button variant="secondary" fullWidth className="justify-start h-11">
                <FolderOpen size={16} className="text-primary" />
                Create Folder
              </Button>
              <Button variant="secondary" fullWidth className="justify-start h-11">
                <Settings size={16} className="text-primary" />
                Gallery Settings
              </Button>
            </CardContent>
          </Card>

          <Card padding="md">
            <CardHeader className="mb-4">
              <CardTitle>Storage Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="space-y-5">
                  {[
                    { label: 'Images', value: '24.2 GB', pct: 45, color: 'bg-primary' },
                    { label: 'Videos', value: '18.5 GB', pct: 35, color: 'bg-success' },
                    { label: 'Documents', value: '5.8 GB', pct: 15, color: 'bg-warning' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-text-secondary">{item.label}</span>
                        <span className="font-medium text-text tabular-nums">{item.value}</span>
                      </div>
                      <div className="w-full bg-surface-elevated rounded-full h-1.5">
                        <div
                          className={`${item.color} h-1.5 rounded-full transition-all duration-500`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Total Used (100GB limit)</span>
                    <span className="font-semibold text-text tabular-nums">48.5%</span>
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