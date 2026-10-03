/* Boardroom — curated demo session.
   One recorded run of the board on the example idea, in the same shape the live engine produces.
   It keeps the prototype usable with no API connected. Nothing here claims real-world evidence:
   every "fact" is something a board member says, not a measured result. */
(function () {
  const BR = (window.BR = window.BR || {});

  const IDEA = "A shared grocery list for flatmates that splits the bill automatically when someone checks out.";

  /* First reactions, formed separately before the debate. */
  const positions = {
    ceo: {
      position: "Explore", lean: 1, confidence: "medium",
      headline: "Groceries are a weekly shared spend. That is a habit, not a one-off.",
      key_concern: "Is this a big enough problem to be a priority?",
      key_assumption: "Flats feel this often enough to change tools.",
      reasoning: "Most shared costs in a flat are settled once a month. Groceries happen every week and involve everyone, which makes them worth a closer look."
    },
    investor: {
      position: "Cautious", lean: 0, confidence: "medium",
      headline: "Splitwise has owned shared money for years. Why has not it done this?",
      key_concern: "Nothing stops an existing app from adding a list.",
      key_assumption: "There is a gap the big players cannot or will not fill.",
      reasoning: "When the obvious company in a space skips an obvious feature, either nobody wanted it or it did not stick. I would want to know which."
    },
    engineer: {
      position: "Blocked", lean: -1, confidence: "high",
      headline: "'Automatically at checkout' needs shop data we cannot get.",
      key_concern: "Grocery apps do not share what was bought or what it cost.",
      key_assumption: "We can see the basket and total at checkout.",
      reasoning: "Without order data, the 'automatic' part means scanning receipts or linking bank cards. Both add effort exactly where the idea promises none."
    },
    ux: {
      position: "Needs evidence", lean: 0, confidence: "low",
      headline: "We do not know where today's workaround actually breaks.",
      key_concern: "The problem is assumed, not observed.",
      key_assumption: "Splitting the bill is the painful part.",
      reasoning: "Flats already manage this with a group chat and a money app. I would want to watch that happen before designing a replacement."
    },
    customer: {
      position: "Unconvinced", lean: -1, confidence: "high",
      headline: "My flat has a WhatsApp group and Splitwise. Messy, but free.",
      key_concern: "You would have to convince four people, not one.",
      key_assumption: "Everyone in the flat installs it and keeps using it.",
      reasoning: "I would only switch if it is clearly less effort than what we do now. And it only works if all of us switch."
    },
    strategist: {
      position: "Potential", lean: 1, confidence: "medium",
      headline: "Whoever owns the household list knows what the household needs.",
      key_concern: "Is this a list product or a payments product?",
      key_assumption: "The list is more valuable than the bill split.",
      reasoning: "A shared list is a running record of what a home needs before it buys it. That is more interesting than another way to settle debts."
    }
  };

  const turns = [
    /* 1 — Opening arguments */
    { stage: "debate", speaker: "ceo", to: "room", stance: "opens",
      says: "Let me start with why this caught my attention. Groceries are not a once-a-month bill like rent or electricity. Every flat buys them every single week, and everyone who lives there is involved. That makes it the most frequent shared spending decision a household makes. If we are the place where that list lives, we become part of the flat's routine, not an app people open once and forget." },

    { stage: "debate", speaker: "customer", to: "ceo", stance: "challenges",
      says: "I actually live in a flat like this, so let me push back. Yes, we shop every week. But every week our WhatsApp group handles it well enough: someone writes 'need milk', someone else buys it, and we settle up on Splitwise at the end of the month. It is messy, but it is free and everyone's already on it. How often we shop does not tell you I would switch, and you would need all four of us to switch, not just me." },

    { stage: "debate", speaker: "engineer", to: "customer", stance: "builds_on",
      says: "And there is a technical problem underneath what Jordan just said. The idea promises the bill splits 'automatically when someone checks out'. To do that, we would need to see what was bought and how much it cost. Grocery delivery apps do not share order data with other apps, and in a physical shop there is nothing for us to read at all. The workarounds are scanning receipts or linking bank cards, and both add a step at exactly the moment the idea says there will not be one." },

    { stage: "debate", speaker: "investor", to: "ceo", stance: "challenges",
      says: "I want to add one more worry before we get excited. Splitwise has owned shared money between flatmates for years. A shopping list would be an easy feature for them to add, and they have not. That usually means one of two things: either nobody asked for it, or they tried it and people did not stick with it. Both are expensive to find out after we have built something, so I would want to know which one it is first." },

    { stage: "debate", speaker: "ceo", to: "investor", stance: "disagrees",
      says: "I read that differently, Marcus. Splitwise is a ledger. It tracks who owes whom, and that is all it has ever tried to be. Companies rarely build far outside their main product, which is exactly why gaps like this stay open for years. So the fact that they have not built a list is not a warning sign to me, it is the opening. The real question is whether we can get there first and do it properly." },

    { stage: "debate", speaker: "customer", to: "ceo", stance: "cross_q",
      says: "Victoria, can I ask you something directly? You keep saying the market is big and people shop often, and I believe that. But you are treating that as proof that people like me will change what we do. What evidence do you actually have that flats want to move off WhatsApp? Because from where I am sitting, nobody in my flat is unhappy enough to download something new." },

    { stage: "debate", speaker: "ceo", to: "customer", stance: "cross_a",
      says: "That is a fair challenge, and honestly, I do not have that evidence. I still think the opportunity is real, because the weekly habit is real. But I have been treating 'this happens a lot' as if it meant 'people want a new way to do it', and those are not the same thing. So I will adjust my view: I would explore this, but only if we can show that people would actually switch.",
      shift: { position: "Explore, if people switch", lean: 1, why: "Admitted there is no evidence people want to move off WhatsApp." } },

    /* 2 — Digging deeper */
    { stage: "dig", speaker: "ux", to: "ceo", stance: "questions",
      says: "This is where I would slow everyone down. Two assumptions are holding this whole idea up. One, that flats want a new tool at all. Two, that splitting the bill is the painful part. Neither has been tested. Nobody here has sat with a real flat and watched their group chat for a week to see where it actually breaks, so right now we are designing for a problem we have imagined rather than one we have seen." },

    { stage: "dig", speaker: "engineer", to: "ux", stance: "builds_on",
      says: "Then let me suggest something practical. We drop the automatic splitting from the first version entirely. A shared list with a simple 'I paid' button could be built in a couple of weeks, with none of the data problems I mentioned. That lets us answer Priya's question cheaply. If people do not use the list, the bill splitting never mattered. If they do, we will know exactly what to build next.",
      shift: { position: "Explore with constraints", lean: 1, why: "Happy to build it if the first version skips automatic splitting." } },

    { stage: "dig", speaker: "strategist", to: "engineer", stance: "challenges",
      says: "Arjun, that is sensible, but look at what it does to the idea. Take away the automatic split and what is left is a shopping list competing with WhatsApp, which is free and already open on everyone's phone. That is a very hard fight to win. Before we cut the difficult part, I would want an answer to one question: what would this do that a group chat cannot? If we cannot answer that, the simpler version does not really help us." },

    { stage: "dig", speaker: "customer", to: "room", stance: "reframes",
      says: "Can I say what actually happens in my flat? The arguments are almost never about who paid. The money gets sorted out eventually. What really annoys people is when someone finishes the milk, or the washing-up liquid, and does not tell anyone. Then you go to make tea and there is nothing there. If something fixed that, I would genuinely try it. The bill splitting, I could take or leave.",
      shift: { position: "Would try that", lean: 0, why: "Interested if it solves running out of things, not paying." } },

    { stage: "dig", speaker: "ux", to: "customer", stance: "builds_on",
      says: "That is the most useful thing anyone has said today, because it comes from living with the problem rather than imagining it. It is still one person's experience, not research, so we should not treat it as proven. But it suggests the real pain is the moment something runs out, not the moment someone pays. We may have designed for the wrong half of the week, and that is worth testing before anything else." },

    { stage: "dig", speaker: "investor", to: "customer", stance: "agrees",
      says: "I will admit that changes how I see it. A 'running low' button gets pressed every time something runs out, so it turns into a habit, week after week. Habits are what keep people coming back to a product. A bill splitter is just a feature, and Splitwise could copy it in a month. I am still not convinced by the original pitch, but this version I would look at seriously.",
      shift: { position: "Conditional", lean: 0, why: "Interested in the 'running low' idea, not in bill splitting." } },

    { stage: "dig", speaker: "strategist", to: "room", stance: "reframes",
      says: "And that answers my question to Arjun. If the product is about never running out of shared things, it stops being a copy of WhatsApp. It becomes a record of what the household needs, week after week, which a group chat cannot give you. Payments could still come later, built on top of a list people already rely on. That is a much stronger position than another way to split bills.",
      shift: { position: "Promising", lean: 1, why: "The 'never run out' angle gives it something WhatsApp cannot do." } },

    /* 3 — Wrapping up */
    { stage: "wrap", speaker: "customer", to: "strategist", stance: "questions",
      says: "I like where this has ended up, but one thing still worries me. It only works if everyone in the flat uses it. In my flat there is always one person who will not bother. If they do not press the button when they finish the milk, the list is wrong by Wednesday and we are all back on WhatsApp. The new idea fixes why I would use it, but not the problem of who has to use it.",
      shift: { position: "Unconvinced", lean: -1, why: "Still only works if every flatmate joins in." } },

    { stage: "wrap", speaker: "ux", to: "room", stance: "converges",
      says: "Then let us not build anything big yet. Let us test it. Give ten flats a simple 'running low' button for five shared items, like milk, bread and toilet roll, and watch what happens for two weeks. If people keep pressing it in the second week without being reminded, we have found something real. If they stop, we have saved months of work. Either way, we will learn the thing we are currently guessing.",
      shift: { position: "Test first", lean: 0, why: "Has a cheap test that would give real evidence." } },

    { stage: "wrap", speaker: "ceo", to: "ux", stance: "agrees",
      says: "Agreed. I still think this matters, so I would make time for it, but as an experiment, not as a full product on the roadmap. Run Priya's two-week test, include Jordan's worry about the flatmate who will not join in, and come back with what actually happened. Then we decide whether it deserves a proper team." }
  ];

  const verdict = {
    score: 6,
    headline: "Right flat, wrong problem first.",
    signal: "Worth exploring, but not as pitched, and not ready to build yet.",
    fatal_flaw: "It asks a whole flat to leave a group chat that already works, for an automatic split that needs shop data no grocery app shares.",
    hidden_opportunity: "The bigger pain is running out of shared things. A 'running low' button could become a weekly habit, which bill splitting never will.",
    build_first: "Test a 'running low' button for five shared items with ten flats for two weeks, before writing any payment code.",
    votes: [
      { speaker: "ceo",        vote: "Explore",                 lean: 1,  why: "Worth an experiment, not a full product yet." },
      { speaker: "investor",   vote: "Conditional",             lean: 0,  why: "Interested in 'running low', not in bill splitting." },
      { speaker: "engineer",   vote: "Explore with constraints", lean: 1, why: "Buildable if version one skips automatic splitting." },
      { speaker: "ux",         vote: "Test first",              lean: 0,  why: "Nobody has watched real flats yet. The test would." },
      { speaker: "customer",   vote: "Unconvinced",             lean: -1, why: "Would try it, but it needs every flatmate to join." },
      { speaker: "strategist", vote: "Promising",               lean: 1,  why: "'Never run out' is something WhatsApp cannot do." }
    ]
  };

  /* Follow-up questions the person can put to the board after the verdict. */
  const angles = {
    flaw: {
      label: "Tackle the biggest risk",
      question: "What if one flatmate never joins?",
      turns: [
        { speaker: "customer", to: "room", stance: "opens",
          says: "There is always one. In my flat it is Sam. He is lovely, but he will never install another app. If Sam finishes the milk and does not press anything, the list is wrong by Wednesday, and the rest of us stop trusting it." },
        { speaker: "engineer", to: "customer", stance: "builds_on",
          says: "Then the list cannot depend on everyone installing an app. We could make it a link that opens in any browser, and send a short summary into the group chat they already use. Sam can tap 'running low' without signing up for anything. That is a design rule for the first version, not an extra feature." },
        { speaker: "ux", to: "engineer", stance: "builds_on",
          says: "I would also check whether most flats have one person who does the shopping. If they do, the product only needs to work really well for that one person, and everyone else just taps a link. That is a much smaller ask than getting four people to change their habits at once." }
      ],
      takeaway: "Design for one organiser, with everyone else using a simple link. Then the idea no longer depends on the least interested flatmate."
    },
    opportunity: {
      label: "Stress-test the opportunity",
      question: "Is 'running low' a real problem, or just a good story?",
      turns: [
        { speaker: "investor", to: "customer", stance: "challenges",
          says: "Let us be careful. 'Running low' sounds right because Jordan said it with feeling. But one person's milk is not a market. I would hate for us to fall for a good anecdote the same way we nearly fell for bill splitting." },
        { speaker: "ux", to: "investor", stance: "agrees",
          says: "Agreed, it is one account. That is why the test should count what people do, not what they say. We count how often the button gets pressed without anyone reminding them. Saying you have a problem costs nothing. Pressing a button every week shows it." },
        { speaker: "investor", to: "ux", stance: "agrees",
          says: "Then let us agree on when we would stop before the test starts. If fewer than half the flats are still pressing it in week two, we drop the idea and move on. Deciding that now stops us talking ourselves into it later." }
      ],
      takeaway: "'Running low' is a promising guess, not a fact. Decide in advance what result would make you stop."
    },
    customer: {
      label: "Ask Jordan directly",
      question: "What would actually make you switch?",
      turns: [
        { speaker: "customer", to: "room", stance: "opens",
          says: "Three things. It has to be quicker than typing in the group chat. Sam cannot need an app. And it cannot feel like it is tracking who eats what, because then it just becomes another thing to argue about." },
        { speaker: "ux", to: "customer", stance: "builds_on",
          says: "That last point matters most. If the list records who finished the milk, it turns into a blame log, and people stop pressing the button so they do not get blamed. So the button should be anonymous. It just says something is running low, not who used it." },
        { speaker: "strategist", to: "ux", stance: "builds_on",
          says: "Which is the opposite of the original pitch. Automatic splitting is all about who owes what. This treats the flat as one household looking after itself together. That is a friendlier product, and a more distinctive one." }
      ],
      takeaway: "Keep 'running low' anonymous. Tracking who used what would kill the habit."
    }
  };

  BR.demo = {
    IDEA,
    isExample: (text) => normalise(text) === normalise(IDEA),
    session: () => JSON.parse(JSON.stringify({ positions, turns, verdict })),
    angles
  };

  function normalise(t) {
    return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }
})();
