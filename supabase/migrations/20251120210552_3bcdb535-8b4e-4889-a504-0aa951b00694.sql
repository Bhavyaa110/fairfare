-- Add missing UPDATE and DELETE policies for feedback table
CREATE POLICY "Users can update their own feedback"
ON feedback FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
ON feedback FOR DELETE
USING (auth.uid() = user_id);

-- Add missing DELETE policies for bookings table
CREATE POLICY "Users can delete their own bookings"
ON bookings FOR DELETE
USING (auth.uid() = user_id);

-- Add missing DELETE policy for profiles table
CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE
USING (auth.uid() = id);