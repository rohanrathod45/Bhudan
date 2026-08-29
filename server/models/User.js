const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'disaster_authority', 'analyst', 'field_officer', 'viewer'],
      default: 'viewer',
    },
    designation: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    active: { type: Boolean, default: true },
    resetToken: { type: String, default: null },
    resetExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id ? this._id.toString() : this.id,
    name: this.name,
    email: this.email,
    role: this.role,
    designation: this.designation,
    district: this.district,
    active: this.active,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);