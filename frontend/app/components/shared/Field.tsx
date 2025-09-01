/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */
import { Label } from "~/components/ui/label";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className='text-destructive text-sm'>{error}</p>}
    </div>
  );
}
