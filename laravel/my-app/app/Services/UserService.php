<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UserService
{
    /**
     * Simulate sending a newsletter email to all users.
     *
     * @return array<string, mixed>
     */
    public function sendNewsletterToAll(): array
    {
        $users = User::all();

        if ($users->isEmpty()) {
            throw new NotFoundHttpException('No users found to send emails to.');
        }

        $emailPayloads = $users->map(function (User $user) {
            $payload = [
                'to' => $user->email,
                'subject' => "Hey {$user->name}, here's your weekly update!",
                'body' => $this->buildEmailBody($user),
                'metadata' => [
                    'user_id' => $user->id,
                    'sent_at' => now()->toIso8601String(),
                    'type' => 'newsletter',
                ],
            ];

            Log::info("Simulated email sent to {$user->email}", $payload);

            return $payload;
        });

        return [
            'total_sent' => $emailPayloads->count(),
            'emails' => $emailPayloads->toArray(),
        ];
    }

    /**
     * Get user statistics and analytics.
     *
     * @return array<string, mixed>
     */
    public function getUserStats(): array
    {
        $users = User::all();

        $domainBreakdown = $users
            ->groupBy(fn (User $user) => explode('@', $user->email)[1])
            ->map(fn (Collection $group) => [
                'count' => $group->count(),
                'users' => $group->pluck('name')->toArray(),
            ])
            ->toArray();

        $recentUsers = $users
            ->filter(fn (User $user) => $user->created_at->isAfter(now()->subDays(7)))
            ->map(fn (User $user) => [
                'name' => $user->name,
                'email' => $user->email,
                'joined' => $user->created_at->diffForHumans(),
            ])
            ->values()
            ->toArray();

        return [
            'total_users' => $users->count(),
            'domain_breakdown' => $domainBreakdown,
            'recent_signups' => $recentUsers,
            'oldest_user' => $users->sortBy('created_at')->first()?->name,
            'newest_user' => $users->sortByDesc('created_at')->first()?->name,
        ];
    }

    /**
     * Search users by name or email with formatted results.
     */
    public function searchUsers(string $query): Collection
    {
        $users = User::query()
            ->where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->get();

        if ($users->isEmpty()) {
            throw new NotFoundHttpException("No users found matching '{$query}'.");
        }

        return $users->map(fn (User $user) => [
            'id' => $user->id,
            'display_name' => strtoupper($user->name),
            'email' => $user->email,
            'initials' => collect(explode(' ', $user->name))
                ->map(fn (string $part) => strtoupper($part[0]))
                ->implode(''),
            'member_since' => $user->created_at->diffForHumans(),
        ]);
    }

    /**
     * Build a simulated email body for a user.
     */
    private function buildEmailBody(User $user): string
    {
        $daysSinceJoin = $user->created_at->diffInDays(now());

        return "Dear {$user->name}, you've been with us for {$daysSinceJoin} days. "
            .'Thank you for being a valued member!';
    }
}
