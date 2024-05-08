import flushAllRedisData from '../src/redis/flushAllRedisData.js';
import { integrateAllDomesticTracks } from '../src/services/collectData';

await flushAllRedisData();
await integrateAllDomesticTracks(new Date('2019-12-30'), new Date('2021-01-03'), 'w');
await integrateAllDomesticTracks(new Date('2021-01-04'), new Date('2022-01-02'), 'w');
await integrateAllDomesticTracks(new Date('2022-01-03'), new Date('2023-01-01'), 'w');
await integrateAllDomesticTracks(new Date('2023-01-02'), new Date('2023-12-31'), 'w');

// const json = `Yea yea yea yea yea yea
// I said
// Certified freak
// Seven days a week
// Wet ass pussy
// Make that pull-out game weak
// Yea yea yea yea
// Yea You fucking
// with some wet ass pussy
// Bring a bucket and a mop
// for this wet ass pussy
// Give me everything you got
// for this wet ass pussy
// Beat it up nigga
// Catch a charge
// Extra large
// And extra hard
// Put this pussy right in yo face
// Swipe yo nose like a credit card
// Hop on top I wanna ride
// I do a Kegel while it’s inside
// Spit in my mouth look in my eyes
// This pussy is wet
// Come take a dive
// Tie me up
// Like I’m a surprise
// Let’s role play
// I wear a disguise
// I want you to park that Big Mac truck
// right in this little garage
// Make it cream
// Make me scream
// Out in public
// Make a scene
// I don’t cook
// I don’t clean
// But let me tell you how I got this ring
// Gobble me swallow me
// Drip down inside of me
// Quick jump out
// 'fore you let it get inside of me
// I tell him where to put it
// never tell him where I’m about to be
// I run down on him
// Before I let a nigga running me
// Talk yo shit
// Bite yo lip
// Ask for a car while you ride that dick
// You really ain’t never gotta
// fuck him for a thang
// He already made his mind up
// before he came
// Now get yo boots and coat
// for this wet ass pussy
// He bought a phone just
// for pictures of this wet ass pussy
// Pay my tuition just to kiss me
// on this wet ass pussy
// Now make it rain
// if you wanna see some wet ass pussy
// Look
// I need a hard hitter
// I need a deep stroker
// I need a Henny drinker
// I need a weed smoker
// Not a garden snake
// I need a king cobra
// With a hook in it
// I hope it lean over
// He got some money then
// that’s where I’m headed
// Pussy A1 just like his credit
// He got a beard
// Well I’m trynna wet it
// I let him taste it
// Now he diabetic
// I don’t wanna spit
// I wanna gulp
// I wanna gag
// I wanna choke
// I want you to touch
// that little dangly dang that swang
// in the back of my throat
// My head game is fire
// Punani Dasani
// It’s going in dry
// It’s coming out soggy
// I ride on that thang
// like the cops is behind me
// I spit on his mic now
// he’s trynna sign me
// Oh
// Your honor I’ma freak bitch
// Hand cuffs leashes
// Switch my wig make it
// feel like he cheating
// Put him on his knees
// give him something to believe in
// Never lost a fight
// but I’m looking for a beating
// In a food chain
// I’m the one that eat ya
// If he ate my ass he’s a bottom feeda
// Big D stands for big demeanor
// I could make you bust
// before I ever meet ya
// If it don’t hang then he can’t bang
// You can’t hurt my feelings
// but I like pain
// If he fuck me and ask who’s is it
// When I ride the dick
// ima spell my name
// Yea yea yea yea
// Yea You fucking
// with some wet ass pussy
// Bring a bucket and a mop
// for this wet ass pussy
// Give me everything you got
// for this wet ass pussy
// Now from the top make it drop
// That’s some wet ass Pussy
// Now get a bucket and a mop
// That’s some wet ass Pussy
// I’m talking WAP WAP WAP
// That’s some wet ass Pussy
// Macaroni in a pot
// That’s some wet ass Pussy`;

// function convertMultilineToJsonString(text) {
//   const lines = text.split('\n');
//   return lines.join('\\n');
// }

// const jsonString = convertMultilineToJsonString(json);

// console.log(JSON.stringify(jsonString));
// // eslint-disable-next-line max-len
