require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');
const Match = require('./models/Match');

const userId = '6926a80dfa61b41005fdd6b6';

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crickmate');
    console.log('MongoDB connected');

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found!');
      process.exit(1);
    }

    console.log('Found user:', user.fullname);

    // Create teams
    const team1 = new Team({
      name: 'Thunder Strikers',
      createdBy: userId,
      players: [userId],
      district: user.district,
      village: user.village || user.district,
      teamType: 'casual'
    });
    await team1.save();
    console.log('✓ Created team:', team1.name);

    const team2 = new Team({
      name: 'Lightning Warriors',
      createdBy: userId,
      players: [],
      district: user.district,
      village: user.village || user.district,
      teamType: 'casual'
    });
    await team2.save();
    console.log('✓ Created team:', team2.name);

    // Create upcoming match (7 days from now)
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 7);

    const upcomingMatch = new Match({
      status: 'upcoming',
      team1: team1._id,
      team2: team2._id,
      createdBy: new mongoose.Types.ObjectId(userId),
      date: upcomingDate,
      time: '10:00 AM',
      groundName: 'Central Cricket Ground',
      district: user.district,
      village: user.village || user.district,
      team1PlayersId: [new mongoose.Types.ObjectId(userId)],
      team2PlayersId: [],
      matchType: 'T20'
    });
    await upcomingMatch.save();
    console.log('✓ Created upcoming match:', upcomingMatch._id);

    // Create past match (7 days ago)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);

    const pastMatch = new Match({
      status: 'past',
      team1: team1._id,
      team2: team2._id,
      createdBy: new mongoose.Types.ObjectId(userId),
      date: pastDate,
      time: '2:00 PM',
      groundName: 'South Stadium',
      district: user.district,
      village: user.village || user.district,
      team1PlayersId: [new mongoose.Types.ObjectId(userId)],
      team2PlayersId: [],
      matchType: 'ODI',
      team1Score: { runs: 245, wickets: 8, overs: 50 },
      team2Score: { runs: 198, wickets: 10, overs: 45.3 },
      winner: team1._id
    });
    await pastMatch.save();
    console.log('✓ Created past match:', pastMatch._id);

    console.log('\n✅ Sample data created successfully!');
    console.log(`\nYou should now see:`);
    console.log(`- 1 upcoming match (${upcomingDate.toDateString()})`);
    console.log(`- 1 past match (${pastDate.toDateString()})`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createSampleData();
