<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class AdminMessageController extends Controller
{
    public function getClients()
    {
        // ID de l'admin, ici on suppose que c'est toujours 1
        $adminId = 1;

        // Récupère les utilisateurs qui ont envoyé au moins 1 message à l'admin
        $clients = User::whereHas('sentMessages', function ($query) use ($adminId) {
            $query->where('receiver_id', $adminId);
        })->get();

        return response()->json([
            'success' => true,
            'data' => $clients
        ]);
    }
}
