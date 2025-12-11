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

export default function AccommodationBookNow({ isNonStuba, bookingData , price }) {
  const { searchParams } = useAccommodationsStore();
  const rooms = searchParams?.rooms || [{ adult: 2, children: [] }];
const [isSubmitted, setIsSubmitted] = useState(false);

  // Reusable, strict validation for name fields
  const nameValidation = z.string()
    .min(2, "Must be at least 2 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Only letters, spaces, hyphens, or apostrophes are allowed");

  // Define Zod schema
  const guestSchema = z.object({
    title: z.string().optional(),
    // A name is optional, but if provided, it must be valid
    firstName: nameValidation.optional().or(z.literal('')),
    lastName: nameValidation.optional().or(z.literal('')),
  });

  const bookingSchema = z.object({
    rooms: z.array(
      z.object({
        leadGuest: guestSchema,
        otherGuests: z.array(guestSchema),
      })
    ),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    specialRequests: z.string().optional(),
  }).refine(data => {
    // The lead guest of the very first room is mandatory.
    const firstRoomLeadGuest = data.rooms?.[0]?.leadGuest;
    return firstRoomLeadGuest?.title && firstRoomLeadGuest?.firstName && firstRoomLeadGuest?.lastName;
  }, {
    // This message isn't shown, but the refinement triggers field errors.
    message: "Lead guest for Room 1 is required.",
    path: ['rooms', 0, 'leadGuest', 'firstName'], // Point to a field to trigger validation
  });

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur', // Validate fields when the user clicks away
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      rooms: rooms.map(room => ({
        leadGuest: { title: '', firstName: '', lastName: '' },
        // FIX: Create a new object for each guest to avoid reference issues.
        otherGuests: Array.from({ length: room.adult - 1 }, () => ({ title: '', firstName: '', lastName: '' })),
      })),
      email: '',
      phone: '',
      specialRequests: '',
    },
  });

  const { fields: roomFields } = useFieldArray({
    control,
    name: "rooms",
  });

  const onSubmit = (data) => {
    console.log("Booking Submitted:", data);
    setIsSubmitted(true);
    // Here you would typically call an API to finalize the booking
    alert('Booking submitted successfully! (See console for data)');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-lg">
      <fieldset disabled={isSubmitted}>
        <h2 className="text-xl font-bold mb-6 text-gray-800">Guest Information</h2>

        {isSubmitted && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
            <p className="font-bold">Booking Confirmed</p>
            <p>Your details have been saved.</p>
          </div>
        )}

      {roomFields.map((roomField, roomIndex) => (
        <div key={roomField.id} className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-gray-700">
            Room {roomIndex + 1}
          </h3>

          {/* Lead Guest */}
          <div className="mb-6">
            <p className="font-medium text-gray-600 mb-3">Lead Guest</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`rooms.${roomIndex}.leadGuest.title`}>Title {roomIndex === 0 && <span className="text-red-500">*</span>}</Label>
                <Select onValueChange={(value) => setValue(`rooms.${roomIndex}.leadGuest.title`, value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                  </SelectContent>
                </Select>
                {errors.rooms?.[0]?.leadGuest?.title && roomIndex === 0 && <p className="text-red-500 text-xs mt-1">{errors.rooms[0].leadGuest.title.message}</p>}
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

          <OtherGuestsFields roomIndex={roomIndex} control={control} errors={errors} setValue={setValue} />
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
      </fieldset>
    </form>
  );
}

// Helper component to correctly manage nested field arrays for "Other Guests"
function OtherGuestsFields({ roomIndex, control, errors, setValue }) {
  const { fields } = useFieldArray({
    control,
    name: `rooms.${roomIndex}.otherGuests`,
  });

  if (fields.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="font-medium text-gray-600 mb-3 pt-6 border-t mt-6">Other Guests</p>
      {fields.map((field, guestIndex) => (
        <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-md">
          <div>
            <Label htmlFor={`rooms.${roomIndex}.otherGuests.${guestIndex}.title`}>Title</Label>
            <Select onValueChange={(value) => setValue(`rooms.${roomIndex}.otherGuests.${guestIndex}.title`, value, { shouldValidate: true })}>
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
            <Input {...control.register(`rooms.${roomIndex}.otherGuests.${guestIndex}.firstName`)} />
            {errors.rooms?.[roomIndex]?.otherGuests?.[guestIndex]?.firstName && <p className="text-red-500 text-xs mt-1">{errors.rooms[roomIndex].otherGuests[guestIndex].firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor={`rooms.${roomIndex}.otherGuests.${guestIndex}.lastName`}>Last Name</Label>
            <Input {...control.register(`rooms.${roomIndex}.otherGuests.${guestIndex}.lastName`)} />
            {errors.rooms?.[roomIndex]?.otherGuests?.[guestIndex]?.lastName && <p className="text-red-500 text-xs mt-1">{errors.rooms[roomIndex].otherGuests[guestIndex].lastName.message}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}