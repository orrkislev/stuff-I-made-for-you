//: HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">4. Creating a 3D Effect</h2>
<p class="mb-4">Let's add some depth! The ellipse will now appear to rotate in 3D space. Move your mouse from the center to the edge and watch how the ellipse seems to turn in space. Magic? Nope, just math!</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">const ratio = map(dirVector.mag(), 0, width / 2, 1, 0.2)</code>: This line is key! It changes the ratio based on mouse distance from center.</li>
    </ul>
</div>
//: JS
const dirVector = V(mouseX - width / 2, mouseY - height / 2)
const ang = dirVector.heading()
rotate(ang)

ratio = map(dirVector.mag(), 0, width / 2, 1, .2)
size = 100
ellipse(0, 0, size * ratio, size)