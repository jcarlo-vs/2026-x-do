class User {
  #bankBalance = 0;
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  getInfo() {
    return `Name: ${this.name}, Age: ${this.age}`;
  }

  addToBankBalance(amount) {
    this.#bankBalance += amount;
  }

  getBankBalance() {
    return this.#bankBalance;
  }
}

const user1 = new User('Alice', 30);
user1.addToBankBalance(1000);
