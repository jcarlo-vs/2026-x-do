<?php
declare(strict_types= 1);


class User {
    public function __construct(
        public string $name,
        public string $email,
    ) {}
}

function sendEmail(User $user, string $message): void {
    // Simulate sending an email
    echo "Sending email to {$user->email}: {$message}\n";
}


$user = new User("John Doe", "john.doe@example.com");
sendEmail($user, "Hello, this is a test email.");
?>