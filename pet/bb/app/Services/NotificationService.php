<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\AdoptForm;

class NotificationService
{
    public static function createNotification($userId, $type, $content, $relatedId = null)
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'content' => $content,
            'is_read' => false,
            'related_id' => $relatedId
        ]);
    }

    public static function notifyAdminAboutNewAdoption(AdoptForm $adoptForm)
    {
        $adminUsers = User::where('is_admin', true)->get();
        
        foreach ($adminUsers as $admin) {
            self::createNotification(
                $admin->id,
                'new_adoption_request',
                "New adoption request for pet #{$adoptForm->pet_id}",
                $adoptForm->id
            );
        }
    }

    public static function notifyUserAboutAdoptionStatus(AdoptForm $adoptForm)
    {
        if ($adoptForm->user_id) {
            $statusText = $adoptForm->status === 'approved' ? 'approved' : 'rejected';
            self::createNotification(
                $adoptForm->user_id,
                'adoption_status',
                "Your adoption request has been {$statusText}",
                $adoptForm->id
            );
        }
    }
}