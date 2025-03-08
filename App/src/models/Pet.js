class Pet{
    constructor(id, name, email, token) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.token = token; // For authentication
      }
    updateName(newName) {
        this.name = newName;
    }
}