//: HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">6. Perfecting the 3D Illusion</h2>
<p class="mb-4">
    Now we're fine-tuning our 3D effect. The second ellipse will move realistically in front of the first one.
    As you move your mouse, notice how the second ellipse appears to be closer or farther away.
</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">const zOffset = 50</code>: This determines how far 'in front' the second ellipse appears.</li>
        <li><code class="bg-gray-200 px-1 rounded">translate(zOffset * (1 - ratio), 0)</code>: This line is crucial! It adjusts the position based on the viewing angle.</li>
    </ul>
</div>
//: JS
noFill()

const dirVector = V(mouseX - width / 2, mouseY - height / 2)
const ang = dirVector.heading()
rotate(ang)

ratio = map(dirVector.mag(), 0, width / 2, 1, .2)
size = 100
ellipse(0, 0, size * ratio, size)

zOffset = 50
translate(zOffset * (1 - ratio), 0)
size = 80
ellipse(0, 0, size * ratio, size)