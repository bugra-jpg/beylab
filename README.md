# beylab — Buğra Eren Yazıcı

A static personal site led by a fascination with fusion and the future of energy. The four-part scroll story moves from a tokamak with flowing plasma to a bare, brighter plasma ring, and two light nuclei approaching and fusing. No application server, paid API or database is needed.

The scroll animation is an artistic plasma study, not an engineering model or physical simulation. The tokamak envelope fades without deforming the plasma ring. Travelling light accelerates and the plasma brightens before the final transition to two nuclei and their fusion.

## Pages

- `index.html`: personal introduction and research portfolio (English).
- `notes.html`: Turkish writing page with one personal introduction.
- `post.html?p=2026-09-05-kimim-ben`: the new personal introduction. The three previous posts are removed.
- `lab.html`: model collection preview. The tokamak currently links to its owner-private Sites preview; Wendelstein 7-X is planned.

## Run and build

Use `python -m http.server 3010` for a local preview. Use `python scripts/build_site.py` to create `dist/`. The GitHub Pages workflow uploads only this public output. `CNAME` remains `beylab.com.tr`.

The 3D library is vendored under `assets/vendor` with its MIT licence. Motion honours `prefers-reduced-motion`, pauses outside the opening section, and degrades to a readable page when WebGL is unavailable. The moving forms illustrate a research theme; they are not a magnetic equilibrium or material simulation.

## Content

The biography draws on the supplied CV, LinkedIn screenshots, and the user's own description of their fusion interest. Materials appear only in the current-work section. The hero contains the name, engineering programme, fusion interest and illustration. Anadolu studies and the research collaborator's name are omitted at the user's request; the Ankara University affiliation remains. Writing and models are linked from the menu and the bottom of the homepage; article previews and the mid-page model promotion are omitted. The phone number and original CV PDF are not published. Research under development is labelled as such. The three previous posts are removed, including stale copies in build output. Only a short CV-grounded personal introduction remains. The research introduction explains the path from fusion interest to erosion and current electric-propulsion work. AI is presented as a research outlook. No quotation is included, following the user’s final preference.

## Next stages

1. Review this homepage design and language.
2. Publish the approved revision to the existing GitHub Pages site.
3. Create a separate static lab deployment, connect `lab.beylab.com.tr`, and switch collection links to that subdomain.
4. Build the Wendelstein 7-X model and move the current tokamak into the same public static collection, removing the need for ChatGPT sign-in.

Do not change production DNS until the separate lab deployment is available. The METUnic domain registration can remain in place.
