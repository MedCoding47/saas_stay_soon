<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pet;
use Illuminate\Support\Facades\Storage;

class PetController extends Controller
{
    // Get all pets
    public function index()
    {
        $pets = Pet::all();
        return response()->json($pets);
    }

    // Get a specific pet
    public function show($id)
    {
        $pet = Pet::findOrFail($id);
        return response()->json($pet);
    }

    // Store a new pet
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer',
            'location' => 'required|string|max:255',
            'type' => 'required|string',
            'breed' => 'nullable|string|max:255', // Breed is optional
            'picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Store the image in storage/app/public/images
        $imagePath = $request->file('picture')->store('images', 'public');

        // Generate the accessible URL
        $imageUrl = asset('storage/' . $imagePath);

        // Create the pet entry
        $pet = Pet::create([
            'name' => $request->name,
            'breed' => $request->breed,
            'age' => $request->age,
            'location' => $request->location,
            'type' => $request->type,
            'image' => $imageUrl,
        ]);

        return response()->json($pet, 201);
    }

    // Update a pet
    public function update(Request $request, $id)
    {
        $pet = Pet::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer',
            'location' => 'required|string|max:255',
            'type' => 'required|string',
            'breed' => 'nullable|string|max:255',
            'picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Update pet information
        $pet->name = $request->name;
        $pet->age = $request->age;
        $pet->location = $request->location;
        $pet->type = $request->type;
        $pet->breed = $request->breed;

        // Handle image update if a new one is provided
        if ($request->hasFile('picture')) {
            // Delete old image if it exists and is stored locally
            $currentImage = $pet->image;
            
            // Check if current image is a local storage path
            if ($currentImage && strpos($currentImage, '/storage/') !== false) {
                $path = str_replace(asset('storage/'), '', $currentImage);
                Storage::disk('public')->delete($path);
            }
            
            // Store the new image
            $imagePath = $request->file('picture')->store('images', 'public');
            $pet->image = asset('storage/' . $imagePath);
        }

        // Save changes
        $pet->save();

        return response()->json($pet, 200);
    }

    // Delete a pet
    public function destroy($id)
    {
        $pet = Pet::findOrFail($id);
        
        // Delete the associated image if it exists and is stored locally
        $currentImage = $pet->image;
        if ($currentImage && strpos($currentImage, '/storage/') !== false) {
            $path = str_replace(asset('storage/'), '', $currentImage);
            Storage::disk('public')->delete($path);
        }
        
        // Delete the pet record
        $pet->delete();
        
        return response()->json(['message' => 'Pet deleted successfully'], 200);
    }
}