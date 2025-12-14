import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Building2, BedDouble } from "lucide-react";
import type { Block, Room } from "@shared/schema";

const blockFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  floorCount: z.coerce.number().min(1, "At least 1 floor required"),
});

const roomFormSchema = z.object({
  blockId: z.string().min(1, "Block is required"),
  roomNumber: z.string().min(1, "Room number is required"),
  capacity: z.coerce.number().min(1, "Capacity is required"),
  type: z.string().min(1, "Room type is required"),
  floor: z.coerce.number().min(1, "Floor is required"),
  monthlyRent: z.coerce.number().optional(),
});

type BlockFormData = z.infer<typeof blockFormSchema>;
type RoomFormData = z.infer<typeof roomFormSchema>;

export default function BlocksPage() {
  const { toast } = useToast();
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<(Room & { block?: Block }) | null>(null);

  const { data: blocks = [], isLoading: blocksLoading } = useQuery<Block[]>({
    queryKey: ["/api/blocks"],
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery<(Room & { block?: Block })[]>({
    queryKey: ["/api/rooms"],
  });

  const blockForm = useForm<BlockFormData>({
    resolver: zodResolver(blockFormSchema),
    defaultValues: { name: "", description: "", floorCount: 1 },
  });

  const roomForm = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: { blockId: "", roomNumber: "", capacity: 4, type: "NON_AC", floor: 1, monthlyRent: 0 },
  });

  const createBlockMutation = useMutation({
    mutationFn: async (data: BlockFormData) => {
      const res = await apiRequest("POST", "/api/blocks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocks"] });
      setIsBlockDialogOpen(false);
      blockForm.reset();
      toast({ title: "Block created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create block", variant: "destructive" });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: async (data: BlockFormData & { id: string }) => {
      const res = await apiRequest("PATCH", `/api/blocks/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocks"] });
      setIsBlockDialogOpen(false);
      setSelectedBlock(null);
      blockForm.reset();
      toast({ title: "Block updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update block", variant: "destructive" });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/blocks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocks"] });
      toast({ title: "Block deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete block", variant: "destructive" });
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: RoomFormData) => {
      const res = await apiRequest("POST", "/api/rooms", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setIsRoomDialogOpen(false);
      roomForm.reset();
      toast({ title: "Room created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create room", variant: "destructive" });
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async (data: RoomFormData & { id: string }) => {
      const res = await apiRequest("PATCH", `/api/rooms/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setIsRoomDialogOpen(false);
      setSelectedRoom(null);
      roomForm.reset();
      toast({ title: "Room updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update room", variant: "destructive" });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({ title: "Room deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete room", variant: "destructive" });
    },
  });

  const openBlockDialog = (block?: Block) => {
    setSelectedBlock(block || null);
    blockForm.reset(block ? { name: block.name, description: block.description || "", floorCount: block.floorCount || 1 } : { name: "", description: "", floorCount: 1 });
    setIsBlockDialogOpen(true);
  };

  const openRoomDialog = (room?: Room & { block?: Block }) => {
    setSelectedRoom(room || null);
    roomForm.reset(room ? { blockId: room.blockId, roomNumber: room.roomNumber, capacity: room.capacity, type: room.type, floor: room.floor || 1, monthlyRent: Number(room.monthlyRent) || 0 } : { blockId: "", roomNumber: "", capacity: 4, type: "NON_AC", floor: 1, monthlyRent: 0 });
    setIsRoomDialogOpen(true);
  };

  const onBlockSubmit = (data: BlockFormData) => {
    if (selectedBlock) {
      updateBlockMutation.mutate({ ...data, id: selectedBlock.id });
    } else {
      createBlockMutation.mutate(data);
    }
  };

  const onRoomSubmit = (data: RoomFormData) => {
    if (selectedRoom) {
      updateRoomMutation.mutate({ ...data, id: selectedRoom.id });
    } else {
      createRoomMutation.mutate(data);
    }
  };

  const isLoading = blocksLoading || roomsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blocks & Rooms"
        description="Manage hostel buildings and rooms"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Blocks
            </CardTitle>
            <Button size="sm" onClick={() => openBlockDialog()} data-testid="button-add-block">
              <Plus className="h-4 w-4 mr-1" />
              Add Block
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : blocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No blocks found
              </div>
            ) : (
              <div className="space-y-2">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    data-testid={`block-${block.id}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{block.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {block.floorCount} floor(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openBlockDialog(block)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteBlockMutation.mutate(block.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" />
              Rooms
            </CardTitle>
            <Button size="sm" onClick={() => openRoomDialog()} data-testid="button-add-room">
              <Plus className="h-4 w-4 mr-1" />
              Add Room
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rooms found
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    data-testid={`room-${room.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-sm">
                          {room.block?.name} - Room {room.roomNumber}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{room.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Capacity: {room.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openRoomDialog(room)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteRoomMutation.mutate(room.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBlock ? "Edit Block" : "Add Block"}</DialogTitle>
            <DialogDescription>
              {selectedBlock ? "Update block details" : "Create a new building block"}
            </DialogDescription>
          </DialogHeader>
          <Form {...blockForm}>
            <form onSubmit={blockForm.handleSubmit(onBlockSubmit)} className="space-y-4">
              <FormField
                control={blockForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Block A" {...field} data-testid="input-block-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={blockForm.control}
                name="floorCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Floors *</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} data-testid="input-floors" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={blockForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBlockMutation.isPending || updateBlockMutation.isPending} data-testid="button-submit-block">
                  {selectedBlock ? "Update" : "Create"} Block
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRoom ? "Edit Room" : "Add Room"}</DialogTitle>
            <DialogDescription>
              {selectedRoom ? "Update room details" : "Create a new room"}
            </DialogDescription>
          </DialogHeader>
          <Form {...roomForm}>
            <form onSubmit={roomForm.handleSubmit(onRoomSubmit)} className="space-y-4">
              <FormField
                control={roomForm.control}
                name="blockId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-block">
                          <SelectValue placeholder="Select a block" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {blocks.map((block) => (
                          <SelectItem key={block.id} value={block.id}>
                            {block.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={roomForm.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="101" {...field} data-testid="input-room-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={roomForm.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor *</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} data-testid="input-floor" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={roomForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity *</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} data-testid="input-capacity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={roomForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="NON_AC">Non-AC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={roomForm.control}
                name="monthlyRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rent</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} data-testid="input-rent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsRoomDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRoomMutation.isPending || updateRoomMutation.isPending} data-testid="button-submit-room">
                  {selectedRoom ? "Update" : "Create"} Room
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
