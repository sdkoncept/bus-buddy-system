import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStockRequests, useCreateStockRequest, useUpdateStockRequest, useInventoryItems, useCreateStockMovement } from '@/hooks/useInventory';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ClipboardList, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { StockRequestStatus } from '@/types/database';

const statusConfig: Record<StockRequestStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Approved', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'Rejected', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  fulfilled: { label: 'Fulfilled', variant: 'outline', icon: <Package className="h-3 w-3" /> },
};

export default function PartsRequestsTab() {
  const { user, role } = useAuth();
  const { data: requests, isLoading } = useStockRequests();
  const { data: items } = useInventoryItems();
  const createRequest = useCreateStockRequest();
  const updateRequest = useUpdateStockRequest();
  const createMovement = useCreateStockMovement();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'fulfill' | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [requestForm, setRequestForm] = useState({
    item_id: '',
    quantity_requested: 1,
    notes: '',
  });

  const [actionForm, setActionForm] = useState({
    quantity_approved: 0,
    notes: '',
  });

  const canManageRequests = role === 'admin' || role === 'storekeeper';
  const canCreateRequests = role === 'mechanic' || role === 'storekeeper' || role === 'admin';

  // Filter requests based on role and filter
  const filteredRequests = requests?.filter(request => {
    // Non-admin/storekeeper users can only see their own requests
    if (!canManageRequests && request.requested_by !== user?.id) {
      return false;
    }
    // Apply status filter
    if (filterStatus !== 'all' && request.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const pendingCount = requests?.filter(r => r.status === 'pending').length || 0;
  const approvedCount = requests?.filter(r => r.status === 'approved').length || 0;
  const fulfilledCount = requests?.filter(r => r.status === 'fulfilled').length || 0;

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createRequest.mutateAsync({
        ...requestForm,
        requested_by: user.id,
        status: 'pending',
      });
      setIsCreateDialogOpen(false);
      setRequestForm({ item_id: '', quantity_requested: 1, notes: '' });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleOpenActionDialog = (request: any, type: 'approve' | 'reject' | 'fulfill') => {
    setSelectedRequest(request);
    setActionType(type);
    setActionForm({
      quantity_approved: request.quantity_requested,
      notes: '',
    });
    setIsActionDialogOpen(true);
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !actionType || !user) return;

    try {
      if (actionType === 'approve') {
        await updateRequest.mutateAsync({
          id: selectedRequest.id,
          status: 'approved',
          quantity_approved: actionForm.quantity_approved,
          approved_by: user.id,
          notes: actionForm.notes || selectedRequest.notes,
        });
      } else if (actionType === 'reject') {
        await updateRequest.mutateAsync({
          id: selectedRequest.id,
          status: 'rejected',
          approved_by: user.id,
          notes: actionForm.notes || selectedRequest.notes,
        });
      } else if (actionType === 'fulfill') {
        // Create stock movement for the fulfilled request
        await createMovement.mutateAsync({
          item_id: selectedRequest.item_id,
          movement_type: 'out',
          quantity: selectedRequest.quantity_approved || selectedRequest.quantity_requested,
          reference_type: 'stock_request',
          reference_id: selectedRequest.id,
          notes: `Fulfilled stock request`,
          created_by: user.id,
        });

        await updateRequest.mutateAsync({
          id: selectedRequest.id,
          status: 'fulfilled',
          fulfilled_at: new Date().toISOString(),
        });
      }

      setIsActionDialogOpen(false);
      setSelectedRequest(null);
      setActionType(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fulfilledCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Parts Requests</CardTitle>
              <CardDescription>
                {canManageRequests ? 'Manage all parts requests' : 'View your parts requests'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                </SelectContent>
              </Select>
              {canCreateRequests && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Parts Request</DialogTitle>
                      <DialogDescription>Request parts or supplies from inventory</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateRequest} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="item">Item</Label>
                        <Select
                          value={requestForm.item_id}
                          onValueChange={(value) => setRequestForm({ ...requestForm, item_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {items?.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.quantity} available)
                              </SelectItem>
                            ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity Needed</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={requestForm.quantity_requested}
                          onChange={(e) => setRequestForm({ ...requestForm, quantity_requested: parseInt(e.target.value) || 1 })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes / Justification</Label>
                        <Textarea
                          id="notes"
                          value={requestForm.notes}
                          onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                          placeholder="Reason for request..."
                          rows={3}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createRequest.isPending || !requestForm.item_id}>
                          Submit Request
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty Requested</TableHead>
                <TableHead>Qty Approved</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Notes</TableHead>
                {canManageRequests && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManageRequests ? 7 : 6} className="text-center text-muted-foreground py-8">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests?.map((request) => {
                  const status = statusConfig[request.status];
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.item?.name || 'Unknown Item'}</TableCell>
                      <TableCell>{request.quantity_requested}</TableCell>
                      <TableCell>{request.quantity_approved ?? '-'}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1">
                          {status.icon}
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {request.notes || '-'}
                      </TableCell>
                      {canManageRequests && (
                        <TableCell>
                          <div className="flex gap-1">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => handleOpenActionDialog(request, 'approve')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  onClick={() => handleOpenActionDialog(request, 'reject')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {request.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8"
                                onClick={() => handleOpenActionDialog(request, 'fulfill')}
                              >
                                Fulfill
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Request'}
              {actionType === 'reject' && 'Reject Request'}
              {actionType === 'fulfill' && 'Fulfill Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'Approve this parts request and specify the quantity'}
              {actionType === 'reject' && 'Reject this request with a reason'}
              {actionType === 'fulfill' && 'Mark this request as fulfilled and deduct from inventory'}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <form onSubmit={handleAction} className="space-y-4">
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="font-medium">{selectedRequest.item?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Requested: {selectedRequest.quantity_requested} units
                </p>
                {selectedRequest.item && (
                  <p className="text-sm text-muted-foreground">
                    Available: {selectedRequest.item.quantity} units
                  </p>
                )}
              </div>

              {actionType === 'approve' && (
                <div className="space-y-2">
                  <Label htmlFor="qty_approved">Quantity to Approve</Label>
                  <Input
                    id="qty_approved"
                    type="number"
                    min="1"
                    max={selectedRequest.item?.quantity || selectedRequest.quantity_requested}
                    value={actionForm.quantity_approved}
                    onChange={(e) => setActionForm({ ...actionForm, quantity_approved: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              )}

              {(actionType === 'approve' || actionType === 'reject') && (
                <div className="space-y-2">
                  <Label htmlFor="action_notes">
                    {actionType === 'reject' ? 'Reason for Rejection' : 'Notes (optional)'}
                  </Label>
                  <Textarea
                    id="action_notes"
                    value={actionForm.notes}
                    onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                    placeholder={actionType === 'reject' ? 'Explain why...' : 'Additional notes...'}
                    rows={3}
                    required={actionType === 'reject'}
                  />
                </div>
              )}

              {actionType === 'fulfill' && (
                <p className="text-sm text-muted-foreground">
                  This will deduct {selectedRequest.quantity_approved || selectedRequest.quantity_requested} units from inventory.
                </p>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={actionType === 'reject' ? 'destructive' : 'default'}
                  disabled={updateRequest.isPending || createMovement.isPending}
                >
                  {actionType === 'approve' && 'Approve'}
                  {actionType === 'reject' && 'Reject'}
                  {actionType === 'fulfill' && 'Fulfill'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
