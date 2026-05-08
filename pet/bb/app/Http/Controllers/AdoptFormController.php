<?php

namespace App\Http\Controllers;

use App\Models\AdoptForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdoptFormController extends Controller
{
    public function store(Request $request)
    {
        try {
            Log::info('Adoption form submission', ['data' => $request->all()]);

            $validatedData = $request->validate([
                'pet_id' => 'required|exists:pets,id',
                'email' => 'required|email',
                'phoneNo' => 'required',
                'adoption_reason' => 'required',
            ]);

            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'message' => 'Vous devez être connecté pour faire une demande d\'adoption.'
                ], 401);
            }

            // ✅ Empêche toute nouvelle demande d’un utilisateur s’il en a déjà fait une
            $existingForm = AdoptForm::where('user_id', $user->id)->first();

            if ($existingForm) {
                return response()->json([
                    'message' => 'Vous avez déjà soumis une demande d\'adoption. Une seule demande est autorisée.'
                ], 403);
            }

            $form = new AdoptForm();
            $form->pet_id = $request->pet_id;
            $form->adoption_reason = $request->adoption_reason;
            $form->contact_phone = $request->phoneNo;
            $form->contact_email = $request->email;
            $form->address = $request->livingSituation ?? null;
            $form->previous_pets = $request->previousExperience ?? null;
            $form->motivation = $request->familyComposition ?? null;
            $form->status = 'pending';
            $form->user_id = $user->id;
            $form->save();

            return response()->json([
                'message' => 'Formulaire soumis avec succès',
                'data' => $form
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating adoption form', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la soumission du formulaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
