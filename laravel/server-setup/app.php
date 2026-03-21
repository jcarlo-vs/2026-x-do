<?php


class User
{
    public $name;
    public $age;
    public function __construct(string $name, string $age)
    {
        $this->name = $name;
        $this->age = $age;

    }
}


$user = new User("John Doe", "30");
