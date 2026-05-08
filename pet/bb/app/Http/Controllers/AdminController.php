<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Check if the user is an admin
            if (!$user->isAdmin()) {
                return response()->json(['error' => 'Unauthorized access'], 403);
            }

            $token = $user->createToken('admin-token', ['admin'])->plainTextToken;
            return response()->json([
                'token' => $token,
                'user' => $user
            ], 200);
        }

        return response()->json(['error' => 'Invalid credentials'], 401);
    }

    // Method to create admin user (optional, can be used to create first admin)
    public function createAdmin(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $admin = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'is_admin' => true
        ]);

        return response()->json([
            'message' => 'Admin created successfully',
            'user' => $admin
        ], 201);
    }
}