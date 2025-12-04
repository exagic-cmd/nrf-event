"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccommodationsStore } from '@/store/useAccommodationsStore';

export default function AccommodationBookNow({ isNonStuba, bookingData }) {
  const { searchParams } = useAccommodationsStore();
  const rooms = searchParams?.rooms || [{ adult: 2, children: [] }];

  // Define Zod schema
  const guestSchema = z.object({
    title: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  });

  // Schema for the lead guest of the very first room (mandatory)
  const firstRoomLeadGuestSchema = z.object({
    title: z.string().min(1, "Title is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  });

  // Schema for lead guests of subsequent rooms (optional)
  const leadGuestSchema = z.object({
    title: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  });

  const roomSchema = z.object({
    leadGuest: leadGuestSchema,
    otherGuests: z.array(guestSchema),
  });

  const bookingSchema = z.object({
    rooms: z.array(z.object({
      // Use a conditional schema for the leadGuest
      leadGuest: z.lazy((data, ctx) => {
        // Check if it's the first room in the array
        if (ctx.path.includes('rooms.0')) {
          return firstRoomLeadGuestSchema;
        }
        return leadGuestSchema;
      }),
      otherGuests: z.array(guestSchema),
    })),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    specialRequests: z.string().optional(),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      rooms: rooms.map(room => ({
        leadGuest: { title: '', firstName: '', lastName: '' },
        otherGuests: Array(room.adult - 1).fill({ title: '', firstName: '', lastName: '' }),
      })),
      email: '',
      phone: '',
      specialRequests: '',
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "rooms",
  });

  const onSubmit = (data) => {
    console.log("Booking Submitted:", data);
    // Here you would typically call an API to finalize the booking
    alert('Booking submitted successfully! (See console for data)');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Guest Information</h2>

      {fields.map((field, roomIndex) => (
        <div key={field.id} className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-gray-700">
            Room {roomIndex + 1}
          </h3>

          {/* Lead Guest */}
          <div className="mb-6">
            <p className="font-medium text-gray-600 mb-3">Lead Guest</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`rooms.${roomIndex}.leadGuest.title`}>Title {roomIndex === 0 && <span className="text-red-500">*</span>}</Label>
                <Select onValueChange={(value) => register(`rooms.${roomIndex}.leadGuest.title`).onChange({ target: { value } })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                  </SelectContent>
                </Select>
                {errors.rooms?.[roomIndex]?.leadGuest?.title && <p className="text-red-500 text-xs mt-1">{errors.rooms[roomIndex].leadGuest.title.message}</p>}
              </div>
              <div>
                <Label htmlFor={`rooms.${roomIndex}.leadGuest.firstName`}>First Name {roomIndex === 0 && <span className="text-red-500">*</span>}</Label>
                <Input {...register(`rooms.${roomIndex}.leadGuest.firstName`)} />
                {errors.rooms?.[roomIndex]?.leadGuest?.firstName && <p className="text-red-500 text-xs mt-1">{errors.rooms[roomIndex].leadGuest.firstName.message}</p>}
              </div>
              <div>
                <Label htmlFor={`rooms.${roomIndex}.leadGuest.lastName`}>Last Name {roomIndex === 0 && <span className="text-red-500">*</span>}</Label>
                <Input {...register(`rooms.${roomIndex}.leadGuest.lastName`)} />
                {errors.rooms?.[roomIndex]?.leadGuest?.lastName && <p className="text-red-500 text-xs mt-1">{errors.rooms[roomIndex].leadGuest.lastName.message}</p>}
              </div>
            </div>
          </div>

          {/* Other Guests */}
          {rooms[roomIndex].adult > 1 && (
            <div>
              <p className="font-medium text-gray-600 mb-3">Other Guests</p>
              {Array.from({ length: rooms[roomIndex].adult - 1 }).map((_, guestIndex) => (
                <div key={guestIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-md">
                   <div>
                      <Label htmlFor={`rooms.${roomIndex}.otherGuests.${guestIndex}.title`}>Title</Label>
                      <Select onValueChange={(value) => register(`rooms.${roomIndex}.otherGuests.${guestIndex}.title`).onChange({ target: { value } })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mr">Mr</SelectItem>
                          <SelectItem value="Mrs">Mrs</SelectItem>
                          <SelectItem value="Ms">Ms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  <div>
                    <Label htmlFor={`rooms.${roomIndex}.otherGuests.${guestIndex}.firstName`}>First Name</Label>
                    <Input {...register(`rooms.${roomIndex}.otherGuests.${guestIndex}.firstName`)} />
                  </div>
                  <div>
                    <Label htmlFor={`rooms.${roomIndex}.otherGuests.${guestIndex}.lastName`}>Last Name</Label>
                    <Input {...register(`rooms.${roomIndex}.otherGuests.${guestIndex}.lastName`)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <h2 className="text-xl font-bold mb-6 text-gray-800 border-t pt-6 mt-8">Contact Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
          <Input type="tel" {...register("phone")} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="specialRequests">Special Requests</Label>
        <textarea
          {...register("specialRequests")}
          rows="4"
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any special requests? (e.g., late check-in, specific room view)"
        ></textarea>
      </div>

      <div className="mt-8 text-right">
        <Button type="submit" size="lg" className="bg-[#D3202D] hover:bg-[#b71c1c]">
          Confirm Booking
        </Button>
      </div>
    </form>
  );
}