<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\NotificationService;

class AdoptForm extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'pet_id',
        'adoption_reason',
        'email',
        'phone_no',
        'living_situation',
        'previous_experience',
        'family_composition',
        'status',
        'admin_response'
    ];
    
    protected $attributes = [
        'status' => 'pending',
    ];
    
    protected static function booted()
    {
        static::created(function ($adoptForm) {
            NotificationService::notifyAdminAboutNewAdoption($adoptForm);
        });
    }
    
    // Relationships
    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}