import mongoose from 'mongoose';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema(
  {
    email:  { type: String, required: true, lowercase: true },
    pwHash: { type: String, required: true }
  },
  { timestamps: true }
);

userSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

userSchema.statics.register = async function (email, password) {
  const pwHash = await argon2.hash(password);
  return this.create({ email, pwHash });
};

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email })
    .collation({ locale: 'en', strength: 2 });
  if (!user || !(await argon2.verify(user.pwHash, password))) {
    throw new Error('Bad credentials');
  }
  return user;
};

export const User = mongoose.model('User', userSchema);