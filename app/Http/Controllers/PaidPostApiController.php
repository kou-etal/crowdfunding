<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\PaidPost;
use App\Models\PaidPostImage;
use App\Models\PaidPostLike;
use Stripe\Exception\ApiErrorException;


class PaidPostApiController extends Controller
{
public function index()
{
    $userId = Auth::id();

    $paidPosts = PaidPost::with([
            'user:id,name,profile_image',
            'images',
            'likes',
            'purchases'           // 購入判定用
        ])
        ->latest()
        ->get()
        ->map(function ($post) use ($userId) {

            //購入済み判定
            $purchased = false;
            if ($userId) {
                // 投稿者本人なら常に閲覧可
                if ($post->user_id === $userId) {
                    $purchased = true;
                } else {
                    // purchases コレクションに自分の user_id があるか
                    $purchased = $post->purchases->contains('user_id', $userId);
                }
            }

            return [
                'id'           => $post->id,
                'title'        => $post->title,
                'body'         => $purchased ? $post->body : null,       // 未購入ならマスク
                'price'        => $post->price,
                'user'         => $post->user,
                'images'       => $post->images,                         // React 側で blur
                'likes_count'  => $post->likes->count(),
                'liked_by_me'  => $post->likes->contains('user_id', $userId),
                'purchased'    => $purchased,
                'created_at'   => $post->created_at->toDateTimeString(),
            ];
        });

    return response()->json($paidPosts);
}



    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'text' => 'nullable|string|max:2000',
            'price' => 'required|integer|min:100|max:10000', // 例：100円〜1万円
            'images.*' => 'image|max:5000',
        ]);

        $user = $request->user();

        $paidPost = PaidPost::create([
            'user_id' => $user->id,
            'title' => $request->input('title'),
            'body' => $request->input('text'),
            'price' => $request->input('price'),
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('paid_post_images', 'public');
                PaidPostImage::create([
                    'paid_post_id' => $paidPost->id,
                    'path' => config('app.url') . '/storage/' . $path,
                ]);
            }
        }

        return response()->json([
            'message' => '投稿が保存されました',
            'post' => $paidPost->load('images')
        ], 201);
    }
     public function like(PaidPost $paidPost, Request $request)
    {
        $userId = $request->user()->id;

        $like = PaidPostLike::where('paid_post_id', $paidPost->id)
                    ->where('user_id', $userId)
                    ->first();

        if ($like) {
            $like->delete();
            return response()->json(['liked' => false]);
        } else {
            PaidPostLike::create([
                'paid_post_id' => $paidPost->id,
                'user_id' => $userId,
            ]);
            return response()->json(['liked' => true]);
        }
    }
     public function checkout(Request $request)
{
    $request->validate([
        'paid_post_id' => 'required|exists:paid_posts,id',
        'success_url'  => 'required|url',
        'cancel_url'   => 'required|url',
    ]);

    $user = $request->user(); // ログインユーザー（購入者）
    $post = PaidPost::findOrFail($request->paid_post_id);

    // すでに購入済みならエラーを返す
    if ($post->isPurchasedBy($user->id)) {
        return response()->json(['message' => 'すでに購入済みです'], 400);
    }

    Stripe::setApiKey(env('STRIPE_SECRET'));

    try {
        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency'     => 'jpy',
                    'unit_amount'  => $post->price, // 単位は「円」ではなく「最小単位＝銭」
                    'product_data' => [
                        'name' => '有料投稿: ' . $post->title,
                    ],
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'customer_email' => $user->email, // 後の照合やレシート送信用
            'success_url' => $request->success_url . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url'  => $request->cancel_url,
            'metadata' => [
                'user_id'      => $user->id,
                'paid_post_id' => $post->id,
            ],
        ]);
    } catch (ApiErrorException $e) {
        Log::error('Stripe checkout failed', [
            'error' => $e->getMessage(),
            'user_id' => $user->id,
            'paid_post_id' => $post->id,
        ]);

        return response()->json([
            'message' => '決済セッションの作成に失敗しました',
            'error'   => $e->getMessage(), // 開発中は表示してもよい、本番は削除
        ], 500);
    }

    return response()->json(['url' => $session->url]);
}
}
