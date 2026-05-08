<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Get all users (for admin)
     */
    public function index()
    {
        // Vérification directe dans le contrôleur
        if (!Auth::user() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::all();
        return response()->json($users);
    }

    /**
     * Get current authenticated user profile
     */
    public function profile()
    {
        $user = Auth::user();
        return response()->json($user);
    }

    /**
     * Get user details by ID (admin or own profile)
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        
        // Vérifier si l'utilisateur connecté est administrateur ou consulte son propre profil
        if (!Auth::user()->is_admin && Auth::id() != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        return response()->json($user);
    }

    /**
     * Create a new user (admin only)
     */
    public function store(Request $request)
    {
        if (!Auth::user() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'is_admin' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'is_admin' => $request->is_admin ?? false
        ]);

        return response()->json($user, 201);
    }

    /**
     * Update a user (admin or own profile)
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // Vérifier si l'utilisateur connecté est administrateur ou modifie son propre profil
        if (!Auth::user()->is_admin && Auth::id() != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'sometimes|string|min:8',
            'is_admin' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->has('password')) {
            $user->password = bcrypt($request->password);
        }

        // Seuls les administrateurs peuvent changer le statut d'administrateur
        if (Auth::user()->is_admin && $request->has('is_admin')) {
            $user->is_admin = $request->is_admin;
        }

        $user->save();

        return response()->json($user);
    }

    /**
     * Delete a user (admin or own profile)
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Vérifier si l'utilisateur connecté est administrateur ou supprime son propre profil
        if (!Auth::user()->is_admin && Auth::id() != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user->delete();
        
        return response()->json(['message' => 'User deleted successfully']);
    }
}