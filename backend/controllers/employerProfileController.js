import EmployerProfile from '../models/EmployerProfile.js';

// Upsert (Create or Update) Employer Profile
export const upsertEmployerProfile = async (req, res) => {
  try {
    const { companyName, location, website, industry, description } = req.body;
    // We assume the employerId is available from the authenticated token via req.employer.id
    // But let's support passing it through body if needed, otherwise grab from token
    const employerId = req.user?.id || req.body.employerId;

    if (!employerId) {
      return res.status(401).json({ message: 'Unauthorized. Employer ID missing.' });
    }

    let profileData = {
      employerId,
      companyName,
      location,
      website,
      industry,
      description
    };

    if (req.files) {
      if (req.files.logo && req.files.logo.length > 0) {
        profileData.logo = req.files.logo[0].path.replace(/\\/g, '/');
      }
      if (req.files.photos && req.files.photos.length > 0) {
        profileData.photos = req.files.photos.map(file => file.path.replace(/\\/g, '/'));
      }
      if (req.files.video && req.files.video.length > 0) {
        profileData.video = req.files.video[0].path.replace(/\\/g, '/');
      }
    }

    // Upsert: Find by employerId. If exists, update; otherwise, create.
    let profile = await EmployerProfile.findOne({ employerId });

    if (profile) {
      // If we are updating, make sure we merge new photos with old ones if the user didn't overwrite?
      // Actually, standard behavior: if new photos provided, overwrite. If not, keep old.
      profile = await EmployerProfile.findOneAndUpdate(
        { employerId },
        profileData,
        { new: true, runValidators: true }
      );
      res.status(200).json({ message: 'Profile updated successfully', profile });
    } else {
      profile = new EmployerProfile(profileData);
      await profile.save();
      res.status(201).json({ message: 'Profile created successfully', profile });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get profile by Employer ID
export const getEmployerProfile = async (req, res) => {
  try {
    const { employerId } = req.params;
    const profile = await EmployerProfile.findOne({ employerId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
