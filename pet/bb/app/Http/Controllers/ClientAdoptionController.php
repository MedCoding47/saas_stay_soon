<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdoptForm;
use Illuminate\Support\Facades\Auth;

class ClientAdoptionController extends Controller
{
    public function index()
    {
        $requests = AdoptForm::with(['pet'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }
}