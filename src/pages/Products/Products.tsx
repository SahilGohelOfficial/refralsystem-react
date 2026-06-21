import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, Tag, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';

const mockProducts = [
  { id: 1, name: 'Premium Theme', category: 'Software', price: '$49.99', stock: 120, status: 'Active', rating: 4.8 },
  { id: 2, name: 'UI Kit Pro', category: 'Design', price: '$29.00', stock: 50, status: 'Active', rating: 4.9 },
  { id: 3, name: 'Legacy Plugin', category: 'Software', price: '$19.00', stock: 0, status: 'Out of Stock', rating: 4.2 },
  { id: 4, name: 'Icons Pack Vol. 1', category: 'Design', price: '$15.00', stock: 300, status: 'Active', rating: 4.5 },
  { id: 5, name: 'SEO Handbook', category: 'E-Book', price: '$9.99', stock: 1000, status: 'Draft', rating: 0 },
];

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Products</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your store products and inventory.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/50 rounded-t-[20px]">
          <div className="w-full sm:w-96">
            <Input icon={Search} placeholder="Search products..." />
          </div>
          <Button variant="secondary" className="gap-2 shrink-0">
            <Filter size={16} />
            Filters
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {mockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary">
                      <Tag size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-text">{product.name}</div>
                      <div className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                        <Star size={10} className="text-primary fill-primary" /> 
                        {product.rating > 0 ? product.rating : 'No ratings'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="font-medium">{product.price}</TableCell>
                <TableCell>
                  <span className={product.stock === 0 ? 'text-error font-medium' : 'text-text'}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={product.status === 'Active' ? 'success' : product.status === 'Draft' ? 'neutral' : 'error'}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Dropdown align="right" trigger={
                    <button className="p-1 text-text-secondary hover:text-text hover:bg-surface rounded-md transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  }>
                    <DropdownItem><Edit2 size={14} /> Edit</DropdownItem>
                    <DropdownItem danger><Trash2 size={14} /> Delete</DropdownItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
        <Pagination 
          currentPage={currentPage} 
          totalPages={5} 
          onPageChange={setCurrentPage} 
        />
      </Card>
    </div>
  );
};

export default Products;
