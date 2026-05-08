<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddForeignKeysToAdoptFormsTable extends Migration
{
    public function up()
    {
        Schema::table('adopt_forms', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('username')->onDelete('cascade');
            $table->foreign('pet_id')->references('id')->on('pets')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('adopt_forms', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['pet_id']);
        });
    }
}