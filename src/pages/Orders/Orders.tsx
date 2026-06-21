import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Eye, Download, ShoppingBag } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';

const mockOrders = [
  { id: '#ORD-7023', user: 'Alice Johnson', date: 'Today, 10:45 AM', total: '$149.00', status: 'Completed', items: 3 },
  { id: '#ORD-7022', user: 'Bob Smith', date: 'Yesterday, 02:15 PM', total: '$29.99', status: 'Processing', items: 1 },
  { id: '#ORD-7021', user: 'Charlie Brown', date: 'Oct 24, 2023', total: '$89.50', status: 'Pending', items: 2 },
  { id: '#ORD-7020', user: 'Diana Prince', date: 'Oct 23, 2023', total: '$210.00', status: 'Completed', items: 5 },
  { id: '#ORD-7019', user: 'Evan Wright', date: 'Oct 22, 2023', total: '$15.00', status: 'Cancelled', items: 1 },
];

const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Orders</h1>
          <p className="text-sm text-text-secondary mt-1">Track and manage user orders.</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/50 rounded-t-[20px]">
          <div className="w-full sm:w-96">
            <Input icon={Search} placeholder="Search orders by ID or user..." />
          </div>
          <Button variant="secondary" className="gap-2 shrink-0">
            <Filter size={16} />
            Filters
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {mockOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <span className="font-medium text-primary cursor-pointer hover:underline">{order.id}</span>
                </TableCell>
                <TableCell>{order.user}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell className="font-medium text-text">{order.total}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      order.status === 'Completed' ? 'success' : 
                      order.status === 'Processing' ? 'primary' : 
                      order.status === 'Pending' ? 'warning' : 'error'
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Dropdown align="right" trigger={
                    <button className="p-1 text-text-secondary hover:text-text hover:bg-surface rounded-md transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  }>
                    <DropdownItem><Eye size={14} /> View Details</DropdownItem>
                    <DropdownItem><Download size={14} /> Invoice</DropdownItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
        <Pagination 
          currentPage={currentPage} 
          totalPages={12} 
          onPageChange={setCurrentPage} 
        />
      </Card>
    </div>
  );
};

export default Orders;
