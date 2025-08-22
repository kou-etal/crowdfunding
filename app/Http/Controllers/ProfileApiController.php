<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

class ProfileApiController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'ユーザーネームまたはパスワードが間違っています'], 401);
        }
     Auth::login($user);
        return response()->json(['message' => 'ログイン成功', 'user' => $user]);
    }
    public function edit(Request $request){
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function logout(){
        dd(Auth::user());
        Auth::logout();
        return response()->json(['message' => 'ログアウト成功']);
    }
    public function update(ProfileUpdateRequest $request)
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return response()->json([
            'message'=>'更新しました'
        ]);
    }

    public function destroy(Request $request){
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message'=>'削除しました'
        ]);
    }
    public function index()
    {
        return response()->json(
        User::select('id', 'name')->get()
    );
    }
        public function show(Request $request){
   $user = $request->user();

   if($user) {
        return response()->json($request->user());
    }
   return response()->json(null, 200);//REST的には正しくない.本来はAPIにauthつけてAPI側で解決するべき。でもめんどくさい
        }


public function updateIntroduction(Request $request)
{
    $validated = $request->validate([
        'name' => 'string|max:255',
        'full_name' => 'nullable|string|max:255', 
        'bio' => 'nullable|string|max:2000',
        'role' => 'required|in:researcher,supporter',
        'degree' => 'nullable|string|in:修士,博士,その他',
        'expertise' => 'nullable|string|max:255',
        'university' => 'nullable|string|max:255',
        'institute' => 'nullable|string|max:255',
    ]);

   
    if ($validated['role'] === 'researcher') {
        foreach (['degree', 'expertise', 'university', 'institute'] as $field) {
            if (empty($validated[$field])) {
                return response()->json([
                    'message' => "研究者として登録するには「{$field}」の入力が必要です。"
                ], 422);
            }
        }
    } else {
        $validated['degree'] = null;
        $validated['expertise'] = null;
        $validated['university'] = null;
        $validated['institute'] = null;
    }

    $user = $request->user();
    $user->update($validated);

    return response()->json(['message' => 'プロフィールを更新しました']);
}





 

public function uploadImage(Request $request)
{
    $validated = $request->validate([
    
        'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
    ]);

    $path = $request->file('image')->store('profile_images', 'public');

    $user = $request->user();
    $user->profile_image = config('app.url') . '/storage/' . $path; // 絶対URLで保存
    $user->save();

    return response()->json(['profile_image' => $user->profile_image], 200);
}



}


