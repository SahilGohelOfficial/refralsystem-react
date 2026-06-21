import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';

const mockUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', lastActive: '2 mins ago' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active', lastActive: '1 hour ago' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer', status: 'Inactive', lastActive: '5 days ago' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Editor', status: 'Active', lastActive: '10 mins ago' },
  { id: 5, name: 'Evan Wright', email: 'evan@example.com', role: 'Viewer', status: 'Pending', lastActive: 'Never' },
];

const Users = () => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Users Management</h1>
          <p className="text-sm text-text-secondary mt-1">Manage team members and their roles.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus size={16} />
          Add New User
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/50 rounded-t-[20px]">
          <div className="w-full sm:w-96">
            <Input icon={Search} placeholder="Search users by name or email..." />
          </div>
          <Button variant="secondary" className="gap-2 shrink-0">
            <Filter size={16} />
            Filters
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-text">{user.name}</div>
                      <div className="text-xs text-text-secondary">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge 
                    variant={user.status === 'Active' ? 'success' : user.status === 'Pending' ? 'warning' : 'neutral'}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.lastActive}</TableCell>
                <TableCell className="text-right">
                  <Dropdown align="right" trigger={
                    <button className="p-1 text-text-secondary hover:text-text hover:bg-surface rounded-md transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  }>
                    <DropdownItem><Edit2 size={14} /> Edit User</DropdownItem>
                    <DropdownItem danger><Trash2 size={14} /> Remove</DropdownItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
        <Pagination 
          currentPage={currentPage} 
          totalPages={3} 
          onPageChange={setCurrentPage} 
        />
      </Card>
    </div>
  );
};

export default Users;
