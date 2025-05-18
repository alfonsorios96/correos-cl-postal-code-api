import { HttpException } from '@nestjs/common';

export function validatePasswordOrThrow(password: string): void {
  const correctPassword =
    process.env.SEED_PASSWORD ?? 'supersecure-long-password-5481';

  if (password !== correctPassword) {
    const messages = [
      'What are you doing mother fucker?',
      'You shall not pass, script kiddie.',
      'Nice try, Neo. This is not the Matrix.',
      '418 - I am a teapot, and you just brewed nonsense.',
      'You have been stopped by the guardian of the seeds.',
      'Unauthorized? More like unworthy.',
      'Only root may plant these seeds.',
      'No password? No party.',
      'Bro... seriously?',
      'The seed gods frown upon your ignorance.',
      'Expected: password. Received: pure audacity.',
      'Access denied. Go touch some grass.',
      'Password rejected. Please try hacking NASA instead.',
      'Wrong password and now you owe me a coffee.',
      'Who let you in here? Not me.',
      'Go home, you’re drunk on POST requests.',
      'Your attempt has been logged... by a toaster.',
      'This endpoint has rejected your vibes.',
      'Request rejected. Try StackOverflow for sympathy.',
      'Bruh...',
      'Sorry, this endpoint is allergic to bad passwords.',
      'You triggered a firewall powered by bad jokes.',
      'No password, no paradise.',
      'Congratulations, you played yourself.',
      'This endpoint has better security than your bank.',
      'Bad password detected. Self-destruct in 3... 2... 1...',
      'You tried to seed without watering the plants first.',
      'The console is crying right now.',
      'May your POST requests be forever denied.',
      'Nope. Not today, junior.',
      'The force is not with you.',
      'You’ve been rate-limited by karma.',
      'You just got blocked by a rubber duck.',
      'Your credentials were reviewed and found cringe.',
      'This action has been forwarded to your mom.',
      'Go read the docs, they miss you.',
      'Even ChatGPT wouldn’t allow this.',
      'Try again after finishing your coffee.',
      'Wrong password. But at least you tried.',
      'Permission denied. Try using common sense.',
      'You must construct additional pylons.',
      'Try using sudo in real life.',
      'Endpoint sealed by ancient dev magic.',
      'Did you think this was a public API?',
      'This is a secure endpoint. You are not.',
      'Even your dog knows that was a bad idea.',
      'Your keyboard is judging you right now.',
      'Wrong password. Try 1234... just kidding, don’t.',
      'System response: bruh moment detected.',
      'Unauthorized entry attempt... reported to Skynet.',
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    throw new HttpException(randomMessage, 418);
  }
}
