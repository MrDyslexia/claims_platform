import bcrypt from 'bcryptjs';

const hash = bcrypt.hashSync('password123', 10);
console.log('Password hash for password123:');
console.log(hash);

// Verify it works
const isValid = bcrypt.compareSync('password123', hash);
console.log('Verification:', isValid);
